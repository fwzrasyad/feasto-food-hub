import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

interface ReviewSectionProps {
    itemId: number;
}

const ReviewSection = ({ itemId }: ReviewSectionProps) => {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        // Load reviews for this item
        const storedReviews = JSON.parse(localStorage.getItem(`reviews_${itemId}`) || "[]");

        // Add some dummy reviews if empty for demo purposes
        if (storedReviews.length === 0) {
            const dummyReviews = [
                {
                    id: 1,
                    userName: "Ali",
                    rating: 5,
                    comment: "Sedap gila! Best nasi lemak in town.",
                    date: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
                },
                {
                    id: 2,
                    userName: "Sarah",
                    rating: 4,
                    comment: "Portion is generous, but sambal slightly too spicy for me.",
                    date: new Date(Date.now() - 86400000 * 5).toLocaleDateString()
                }
            ];
            setReviews(dummyReviews);
            localStorage.setItem(`reviews_${itemId}`, JSON.stringify(dummyReviews));
        } else {
            setReviews(storedReviews);
        }
    }, [itemId]);

    const handleSubmitReview = () => {
        if (!isAuthenticated || !user) {
            toast.error("Please login to submit a review");
            return;
        }

        if (newRating === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (!newComment.trim()) {
            toast.error("Please write a comment");
            return;
        }

        const newReview: Review = {
            id: Date.now(),
            userName: user.name,
            rating: newRating,
            comment: newComment,
            date: new Date().toLocaleDateString(),
        };

        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem(`reviews_${itemId}`, JSON.stringify(updatedReviews));

        setNewRating(0);
        setNewComment("");
        toast.success("Review submitted successfully!");
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Reviews ({reviews.length})</h3>
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold">{averageRating}</span>
                </div>
            </div>

            {/* Write Review Form */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                <h4 className="font-medium">Write a Review</h4>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewRating(star)}
                        >
                            <Star
                                className={`h-6 w-6 ${star <= (hoverRating || newRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none"
                />
                <Button
                    onClick={handleSubmitReview}
                    className="w-full gradient-primary"
                    disabled={!isAuthenticated}
                >
                    {isAuthenticated ? "Submit Review" : "Login to Review"}
                </Button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 animation-fade-in">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{review.userName}</p>
                                    <p className="text-xs text-muted-foreground">{review.date}</p>
                                </div>
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-foreground/80">{review.comment}</p>
                    </div>
                ))}
                {reviews.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No reviews yet. Be the first!</p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
