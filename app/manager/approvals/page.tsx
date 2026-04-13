"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { mockApprovalRequests } from "@/lib/mock-data"
import type { ApprovalRequest } from "@/lib/types"

export default function ApprovalsPage() {
  const [requests, setRequests] = useState(mockApprovalRequests)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const pendingRequests = requests.filter(r => r.status === "pending")
  const profileEditRequests = pendingRequests.filter(r => r.type === "profile_edit")
  const promotionRequests = pendingRequests.filter(r => r.type === "promotion")
  const cancellationRequests = pendingRequests.filter(r => r.type === "cancellation")

  const handleApprove = (request: ApprovalRequest) => {
    setRequests(requests.map(r => 
      r.id === request.id ? { ...r, status: "approved" as const } : r
    ))
    setShowDetailDialog(false)
    setSelectedRequest(null)
  }

  const handleReject = () => {
    if (!selectedRequest) return
    setRequests(requests.map(r => 
      r.id === selectedRequest.id ? { ...r, status: "rejected" as const } : r
    ))
    setShowRejectDialog(false)
    setShowDetailDialog(false)
    setSelectedRequest(null)
    setRejectReason("")
  }

  const getTypeIcon = (type: ApprovalRequest["type"]) => {
    switch (type) {
      case "profile_edit": return <User className="h-4 w-4" />
      case "promotion": return <Percent className="h-4 w-4" />
      case "cancellation": return <Ticket className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: ApprovalRequest["type"]) => {
    switch (type) {
      case "profile_edit": return "Profile Edit"
      case "promotion": return "Promotion"
      case "cancellation": return "Cancellation"
    }
  }

  const RequestCard = ({ request }: { request: ApprovalRequest }) => (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => {
      setSelectedRequest(request)
      setShowDetailDialog(true)
    }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-muted p-2">
              {getTypeIcon(request.type)}
            </div>
            <div>
              <div className="font-medium">{request.requesterName}</div>
              <div className="text-sm text-muted-foreground">{request.requesterEmail}</div>
              <div className="mt-1 text-sm">{request.description}</div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">
            {getTypeLabel(request.type)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Check className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
          <p className="text-muted-foreground">Review and process pending requests</p>
        </div>
        {pendingRequests.length > 0 && (
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {pendingRequests.length} pending
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employee Profile Edits</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileEditRequests.length}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discount Promotions</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotionRequests.length}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Cancellations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationRequests.length}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different request types */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="profile">
            Profile Edits ({profileEditRequests.length})
          </TabsTrigger>
          <TabsTrigger value="promotions">
            Promotions ({promotionRequests.length})
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
              {pendingRequests.map(request => (
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
              {profileEditRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          {promotionRequests.length === 0 ? (
            <EmptyState message="No pending promotion requests" />
          ) : (
            <div className="grid gap-4">
              {promotionRequests.map(request => (
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
              {cancellationRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRequest && getTypeIcon(selectedRequest.type)}
              {selectedRequest && getTypeLabel(selectedRequest.type)} Request
            </DialogTitle>
            <DialogDescription>
              Review the details and approve or reject this request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Requester</span>
                  <span className="font-medium">{selectedRequest.requesterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span>{selectedRequest.requesterEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline">{getTypeLabel(selectedRequest.type)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <span>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Request Details</Label>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
              </div>

              {selectedRequest.data && (
                <div className="space-y-2">
                  <Label>Additional Information</Label>
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedRequest.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                setShowRejectDialog(true)
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => selectedRequest && handleApprove(selectedRequest)}>
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
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
