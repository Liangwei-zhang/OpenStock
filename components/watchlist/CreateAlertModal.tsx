"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";

interface CreateAlertModalProps {
    symbol: string;
    currentPrice: number;
    onAlertCreated?: () => void;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function CreateAlertModal({
    symbol,
    currentPrice,
    onAlertCreated,
    children,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: CreateAlertModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [targetPrice, setTargetPrice] = useState<string>(currentPrice.toString());
    const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTargetPrice(currentPrice.toString());
    }, [currentPrice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createAlert({
                symbol,
                targetPrice: parseFloat(targetPrice),
                condition,
            });
            toast.success("Alert created successfully");
            setOpen?.(false);
            onAlertCreated?.();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create alert");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
            <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-gray-800 text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-2">Create price alert</DialogTitle>
                    <p className="text-sm text-gray-400">
                        Set a simple threshold for {symbol}. Alerts expire automatically after 90 days.
                    </p>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-2 relative z-10">
                    <div className="grid gap-2">
                        <Label className="text-gray-400 text-sm font-medium">Symbol</Label>
                        <Input
                            disabled
                            value={symbol}
                            className="bg-[#1C1C1F] border-none text-gray-500 shadow-inner rounded-md h-10"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-gray-400 text-sm font-medium">Condition</Label>
                        <Select value={condition} onValueChange={(val: "ABOVE" | "BELOW") => setCondition(val)}>
                            <SelectTrigger className="bg-[#1C1C1F] border-gray-800 text-gray-200 hover:border-gray-700 transition-colors">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1F] border-gray-800 text-gray-200">
                                <SelectItem value="ABOVE">Price moves above</SelectItem>
                                <SelectItem value="BELOW">Price moves below</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-gray-400 text-sm font-medium">Target price</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 font-semibold">$</span>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                placeholder="0.00"
                                className="pl-7 bg-[#1C1C1F] border-gray-800 text-white placeholder:text-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20 transition-all rounded-md h-10 font-mono"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Current price: ${currentPrice.toFixed(2)}</p>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading || !targetPrice}
                            className="w-full bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold h-11 text-base transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                        >
                            {loading ? "Creating alert..." : "Create alert"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
