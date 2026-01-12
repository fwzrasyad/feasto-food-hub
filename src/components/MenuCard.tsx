import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MenuCardProps {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  onAddToCart: (item: any) => void;
  onClick?: () => void;
  isVendor?: boolean;
}

const MenuCard = ({ id, name, price, category, image, onAddToCart, onClick, isVendor }: MenuCardProps) => {
  return (
    <Card
      className="group overflow-hidden hover-lift cursor-pointer shadow-custom-md hover:shadow-custom-lg border-2 hover:border-primary/20 transition-all duration-500"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Badge className="absolute top-4 right-4 bg-white/95 dark:bg-card/95 text-primary backdrop-blur-sm font-semibold px-3 py-1.5 shadow-md">
          {category}
        </Badge>
      </div>

      <CardContent className="p-6">
        <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="flex items-center justify-between mt-4">
          <p className="text-2xl font-display font-bold text-gradient-primary">
            RM {price.toFixed(2)}
          </p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (!isVendor) {
                onAddToCart({ id, name, price, image });
              }
            }}
            disabled={isVendor}
            className={`shadow-md transition-all px-6 py-5 ${isVendor ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'gradient-primary hover:shadow-gold-lg'}`}
          >
            {isVendor ? (
              <span>View</span>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
