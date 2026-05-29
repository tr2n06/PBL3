"use client";

import { useState, useEffect } from "react";
import {
  getPromotionCandidates,
  getMyPendingPromotionRequests,
  getActivePromotions,
  createPromotionRequest,
  createPromotionCancellationRequest,
  getMyPendingPromotionCancellationRequests,
  type PromotionCancellationRequestItem,
  type PromotionCandidate,
  type PromotionRequestItem,
  type ActivePromotionItem,
} from "@/lib/employee-promotions-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tag, Plus, Clock, AlertTriangle, Check, Plane } from "lucide-react";

export default function EmployeePromotionsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState("");
  const [discount, setDiscount] = useState([15]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateFlights, setCandidateFlights] = useState<
    PromotionCandidate[]
  >([]);
  const [pendingPromotions, setPendingPromotions] = useState<
    PromotionRequestItem[]
  >([]);
  const [activePromotions, setActivePromotions] = useState<
    ActivePromotionItem[]
  >([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTarget, setCancelTarget] = useState<ActivePromotionItem | null>(
    null,
  );
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  // Mock pending promotions
  const [pendingCancellationRequests, setPendingCancellationRequests] =
    useState<PromotionCancellationRequestItem[]>([]);
  const handleSubmitCancelRequest = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;

    try {
      setIsCancelSubmitting(true);

      await createPromotionCancellationRequest({
        promotionId: cancelTarget.id,
        reason: cancelReason.trim(),
      });

      const [pending, pendingCancel, active, candidates] = await Promise.all([
        getMyPendingPromotionRequests(),
        getMyPendingPromotionCancellationRequests(),
        getActivePromotions(),
        getPromotionCandidates(),
      ]);

      setPendingPromotions(pending);
      setPendingCancellationRequests(pendingCancel);
      setActivePromotions(active);
      setCandidateFlights(candidates);

      setShowCancelDialog(false);
      setCancelTarget(null);
      setCancelReason("");

      alert("Cancellation request submitted for manager approval.");
    } catch (error) {
      console.error("Create cancellation request failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gửi yêu cầu hủy khuyến mãi thất bại",
      );
    } finally {
      setIsCancelSubmitting(false);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      try {
        const [candidates, pending, pendingCancel, active] = await Promise.all([
          getPromotionCandidates(),
          getMyPendingPromotionRequests(),
          getMyPendingPromotionCancellationRequests(),
          getActivePromotions(),
        ]);

        setCandidateFlights(candidates);
        setPendingPromotions(pending);
        setPendingCancellationRequests(pendingCancel);
        setActivePromotions(active);
      } catch (error) {
        console.error("Load promotions failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const lowOccupancyFlights = candidateFlights.filter(
    (f) => f.occupancyRate < 50,
  );

  const handleSubmit = async () => {
    if (!selectedFlight || !reason) return;

    try {
      setIsSubmitting(true);

      await createPromotionRequest({
        flightId: selectedFlight,
        discount: discount[0],
        reason,
      });

      const [pending, pendingCancel, active, candidates] = await Promise.all([
        getMyPendingPromotionRequests(),
        getMyPendingPromotionCancellationRequests(),
        getActivePromotions(),
        getPromotionCandidates(),
      ]);

      setPendingPromotions(pending);
      setPendingCancellationRequests(pendingCancel);
      setActivePromotions(active);
      setCandidateFlights(candidates);

      setShowCreateDialog(false);
      setSelectedFlight("");
      setDiscount([15]);
      setReason("");
    } catch (error) {
      console.error("Create promotion request failed:", error);
      alert(error instanceof Error ? error.message : "Gửi yêu cầu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFlightInfo =
    candidateFlights.find((f) => f.flightId === selectedFlight) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">
            Create and manage flight promotions
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Promotion Request</DialogTitle>
              <DialogDescription>
                Select a flight and set discount. Requires manager approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Flight</Label>
                <Select
                  value={selectedFlight}
                  onValueChange={setSelectedFlight}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a flight" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidateFlights.map((flight) => (
                      <SelectItem key={flight.flightId} value={flight.flightId}>
                        {flight.flightNumber} - {flight.route} -{" "}
                        {flight.occupancyRate}% filled
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFlight && (
                <>
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Current Price:
                        </span>
                        <span className="ml-2 font-medium">
                          {selectedFlightInfo?.economyPrice}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Occupancy:
                        </span>
                        <span className="ml-2 font-medium">
                          {selectedFlightInfo?.occupancyRate ?? "N/A"}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Discount</Label>
                      <span className="text-xl font-bold text-primary">
                        {discount[0]}%
                      </span>
                    </div>
                    <Slider
                      value={discount}
                      onValueChange={setDiscount}
                      min={5}
                      max={50}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>5%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/10 p-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        New Price (Economy):
                      </span>
                      <span className="ml-2 text-lg font-bold text-primary">
                        $
                        {Math.round(
                          (selectedFlightInfo?.economyPrice || 0) *
                            (1 - discount[0] / 100),
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Justification</Label>
                    <Textarea
                      placeholder="Explain why this promotion is needed..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedFlight || !reason || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit for Approval"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Occupancy Alert */}
      {lowOccupancyFlights.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Flights with Low Occupancy
            </CardTitle>
            <CardDescription>
              These flights may benefit from promotional pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowOccupancyFlights.map((flight) => (
                <Badge
                  key={flight.flightId}
                  variant="outline"
                  className="cursor-pointer transition-colors hover:bg-secondary"
                  onClick={() => {
                    setSelectedFlight(flight.flightId);
                    setShowCreateDialog(true);
                  }}
                >
                  {flight.flightNumber} ({flight.route}) -{" "}
                  {flight.occupancyRate}% filled
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Approval
          </CardTitle>
          <CardDescription>
            Your promotion requests awaiting manager review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPromotions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                      <Tag className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {promo.flightNumber} - {promo.route}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {promo.reason}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      {promo.discount}% discount
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {promo.createdAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Cancellation Requests
          </CardTitle>
          <CardDescription>
            Your promotion cancellation requests awaiting manager review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingCancellationRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending cancellation requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingCancellationRequests.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                      <Tag className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {item.flightNumber} - {item.route}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.reason}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-1">
                      Cancel request
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {item.createdAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Promotions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-accent" />
            Active Promotions
          </CardTitle>
          <CardDescription>
            Currently running promotional flights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activePromotions.length === 0 ? (
            <div className="py-8 text-center">
              <Plane className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No active promotions</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activePromotions.map((promo) => (
                <div key={promo.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-primary" />
                      <span className="font-medium">{promo.flightNumber}</span>
                    </div>
                    <Badge variant="destructive" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {promo.discount}% OFF
                    </Badge>
                  </div>

                  <div className="mb-2 text-lg font-semibold">
                    {promo.route}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-sm text-muted-foreground line-through">
                      ${promo.economyPrice}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      $
                      {Math.round(
                        promo.economyPrice * (1 - promo.discount / 100),
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Economy
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setCancelTarget(promo);
                      setCancelReason("");
                      setShowCancelDialog(true);
                    }}
                  >
                    Request Cancel Promotion
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Promotion Cancellation</DialogTitle>
            <DialogDescription>
              This action requires manager approval. The promotion will remain
              active until approved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {cancelTarget && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Flight:</span>
                    <span className="ml-2 font-medium">
                      {cancelTarget.flightNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Route:</span>
                    <span className="ml-2 font-medium">
                      {cancelTarget.route}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="ml-2 font-medium">
                      {cancelTarget.discount}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cancellation Reason</Label>
              <Textarea
                placeholder="Explain why this promotion should be cancelled..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancelTarget(null);
                setCancelReason("");
              }}
            >
              Close
            </Button>
            <Button
              onClick={handleSubmitCancelRequest}
              disabled={!cancelReason.trim() || isCancelSubmitting}
            >
              {isCancelSubmitting
                ? "Submitting..."
                : "Submit Cancellation Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
