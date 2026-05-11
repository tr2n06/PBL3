"use client"

import { useEffect, useState } from "react"
import {
  getPendingApprovalRequests,
  approveApprovalRequest,
  rejectApprovalRequest,
} from "@/lib/approvals-api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, Clock, User, Percent, Ticket, AlertCircle } from "lucide-react"

import type { ApprovalRequest } from "@/lib/types"

export default function ApprovalsPage() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)

  const isPromotionCreateRequest = (request: ApprovalRequest) =>
    request.type === "promotion" &&
    request.data?.action !== "cancel_promotion"

  const isPromotionCancelRequest = (request: ApprovalRequest) =>
    request.type === "promotion" &&
    request.data?.action === "cancel_promotion"

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const profileEditRequests = pendingRequests.filter((r) => r.type === "profile_edit")
  const promotionCreateRequests = pendingRequests.filter(isPromotionCreateRequest)
  const promotionCancelRequests = pendingRequests.filter(isPromotionCancelRequest)
  const cancellationRequests = pendingRequests.filter((r) => r.type === "cancellation")

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await getPendingApprovalRequests()
        setRequests(data)
      } catch (error) {
        console.error("Load approval requests failed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadRequests()
  }, [])

  const handleApprove = async (request: ApprovalRequest) => {
    try {
      await approveApprovalRequest(request.id)
      setRequests((prev) => prev.filter((r) => r.id !== request.id))
      setShowDetailDialog(false)
      setSelectedRequest(null)
    } catch (error) {
      console.error("Approve request failed:", error)
      alert(error instanceof Error ? error.message : "Approve failed")
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    if (selectedRequest.type === "cancellation") return

    try {
      await rejectApprovalRequest(selectedRequest.id, rejectReason)
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
      setShowRejectDialog(false)
      setShowDetailDialog(false)
      setSelectedRequest(null)
      setRejectReason("")
    } catch (error) {
      console.error("Reject request failed:", error)
      alert(error instanceof Error ? error.message : "Reject failed")
    }
  }

  const getTypeIcon = (type: ApprovalRequest["type"]) => {
    switch (type) {
      case "profile_edit":
        return <User className="h-4 w-4" />
      case "promotion":
        return <Percent className="h-4 w-4" />
      case "cancellation":
        return <Ticket className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  function getTypeLabel(request: ApprovalRequest) {
    if (request.type === "profile_edit") return "Profile Edit"
    if (request.type === "cancellation") return "Cancellation"
    if (request.type === "promotion") {
      return request.data?.action === "cancel_promotion"
        ? "Promotion Cancellation"
        : "Promotion"
    }
    return "Request"
  }

  function getRequesterRoleLabel(role: ApprovalRequest["requesterRole"]) {
    return role === "employee" ? "Employee" : "Customer"
  }

  function getRequestDetail(request: ApprovalRequest) {
    if (request.type === "cancellation") {
      const bookingRef = String(
        request.data?.bookingRef ||
          request.data?.ticketCode ||
          request.data?.bookingCode ||
          "—",
      )
      return `Cancel booking ${bookingRef}`
    }

    if (request.type === "profile_edit") {
      const field = String(request.data?.field || request.data?.fieldName || "profile")
      const oldValue = String(request.data?.oldValue ?? "—")
      const newValue = String(request.data?.newValue ?? "—")
      return `Update ${field} from ${oldValue} to ${newValue}`
    }

    if (request.type === "promotion") {
      const flightCode = String(request.data?.flightNumber || request.data?.flightCode || "—")

      if (request.data?.action === "cancel_promotion") {
        return `Cancel promotion for flight ${flightCode}`
      }

      const discount = String(request.data?.discountPercent || request.data?.discount || "—")
      return `${flightCode} + discount + ${discount}%`
    }

    return request.description
  }

  const RequestCard = ({ request }: { request: ApprovalRequest }) => (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/50"
      onClick={() => {
        setSelectedRequest(request)
        setShowDetailDialog(true)
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold">{request.requesterName}</span>
              <Badge variant="outline">{getRequesterRoleLabel(request.requesterRole)}</Badge>
            </div>

            <div className="mb-2 text-sm text-muted-foreground">
              {getTypeLabel(request)}
            </div>

            <div className="text-sm font-medium">
              {getRequestDetail(request)}
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(request.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-muted p-2">
            {getTypeIcon(request.type)}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <Check className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  if (loading) {
    return <div className="p-6">Loading approval requests...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
          <p className="text-muted-foreground">Review and process pending requests</p>
        </div>
        {pendingRequests.length > 0 && (
          <Badge variant="secondary" className="px-3 py-1 text-lg">
            {pendingRequests.length} pending
          </Badge>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="profile">
            Profile Edits ({profileEditRequests.length})
          </TabsTrigger>
          <TabsTrigger value="promotions">
            Promotions ({promotionCreateRequests.length})
          </TabsTrigger>
          <TabsTrigger value="promotion-cancel">
            Deal Cancellations ({promotionCancelRequests.length})
          </TabsTrigger>
          <TabsTrigger value="cancellations">
            Cancellations ({cancellationRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <EmptyState message="No pending requests. All caught up!" />
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          {profileEditRequests.length === 0 ? (
            <EmptyState message="No pending profile edit requests" />
          ) : (
            <div className="grid gap-4">
              {profileEditRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          {promotionCreateRequests.length === 0 ? (
            <EmptyState message="No pending promotion requests" />
          ) : (
            <div className="grid gap-4">
              {promotionCreateRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="promotion-cancel" className="space-y-4">
          {promotionCancelRequests.length === 0 ? (
            <EmptyState message="No pending promotion cancellation requests" />
          ) : (
            <div className="grid gap-4">
              {promotionCancelRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-4">
          {cancellationRequests.length === 0 ? (
            <EmptyState message="No pending cancellation requests" />
          ) : (
            <div className="grid gap-4">
              {cancellationRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRequest && getTypeIcon(selectedRequest.type)}
              {selectedRequest && getTypeLabel(selectedRequest)} Request
            </DialogTitle>
            <DialogDescription>
              Review the details and approve or reject this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="font-medium">{selectedRequest.requesterName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge variant="outline">
                    {getRequesterRoleLabel(selectedRequest.requesterRole)}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span>{selectedRequest.requesterEmail}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span>{String(selectedRequest.data?.phone || "—")}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type Approval</span>
                  <Badge variant="outline">{getTypeLabel(selectedRequest)}</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date Changed</span>
                  <span>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Detail Request</Label>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm">{getRequestDetail(selectedRequest)}</p>
                </div>
              </div>

              {(selectedRequest.type === "cancellation" ||
                (selectedRequest.type === "promotion" &&
                  selectedRequest.data?.action === "cancel_promotion")) && (
                <div className="space-y-2">
                  <Label>Cancellation Reason</Label>
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-sm">
                      {String(
                        selectedRequest.data?.cancelReason ||
                          selectedRequest.data?.reason ||
                          "—",
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            {selectedRequest?.type !== "cancellation" && (
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  setShowRejectDialog(true)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            )}

            <Button onClick={() => selectedRequest && handleApprove(selectedRequest)}>
              <Check className="mr-2 h-4 w-4" />
              {selectedRequest?.type === "cancellation" ? "Confirm" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Reject Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}