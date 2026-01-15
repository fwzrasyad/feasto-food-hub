import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import ReviewSection from "@/components/ReviewSection";
import { useState } from "react";
import { toast } from "sonner";

interface ItemDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: number;
        name: string;
        description?: string;
        price: number;
        image: string;
        category: string;
        vendorId?: number;
    } | null;
    onAddToCart: (item: any, quantity: number) => void;
    isVendor?: boolean;
}

const ItemDetailsDialog = ({ isOpen, onClose, item, onAddToCart, isVendor }: ItemDetailsDialogProps) => {
    const [quantity, setQuantity] = useState(1);

    if (!item) return null;

    const handleAddToCart = () => {
        onAddToCart({ ...item }, quantity);
        setQuantity(1);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold">{item.name}</DialogTitle>
                    <DialogDescription>
                        {item.category}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                        />
                        <Badge className="absolute top-4 right-4 bg-background/90 text-primary backdrop-blur-sm">
                            RM {item.price.toFixed(2)}
                        </Badge>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground">{item.description || "No description available."}</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">Quantity</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-bold">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="text-xl font-bold text-primary">RM {(item.price * quantity).toFixed(2)}</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        disabled={isVendor}
                        className={`w-full text-lg py-6 shadow-lg ${isVendor ? "bg-muted text-muted-foreground cursor-not-allowed" : "gradient-primary shadow-primary/20"}`}
                    >
                        {isVendor ? (
                            <span>Vendor View Only</span>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart - RM {(item.price * quantity).toFixed(2)}
                            </>
                        )}
                    </Button>

                    <div className="border-t pt-6">
                        <ReviewSection itemId={item.id} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ItemDetailsDialog;
