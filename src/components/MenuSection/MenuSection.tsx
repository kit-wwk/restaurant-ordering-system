import { Card, CardContent, Typography, Box } from "@mui/material";
import Image from "next/image";
import type { MenuItem } from "@/types/restaurant";
import { formatPrice } from "@/utils/format";
import AddToCartButton from "./AddToCartButton";

interface MenuSectionProps {
  items: MenuItem[];
  selectedCategory?: string;
}

export default function MenuSection({
  items,
  selectedCategory,
}: MenuSectionProps) {
  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {filteredItems.map((item) => (
        <Box
          key={item.id}
          sx={{
            width: {
              xs: "100%",
              sm: "calc(50% - 24px)",
              md: "calc(25% - 24px)",
            },
            minWidth: { md: "250px" },
          }}
        >
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "200px",
                overflow: "hidden",
              }}
            >
              <Image
                src={item.imageUrl || "/images/default-menu-item.jpg"}
                alt={item.name}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                priority={false}
              />
            </Box>
            <CardContent
              sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  minHeight: "3.6em",
                }}
              >
                {item.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  minHeight: "2.5em",
                }}
              >
                {item.description}
              </Typography>
              <Box
                sx={{
                  mt: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" color="primary">
                  HK$ {formatPrice(item.price)}
                </Typography>
                <AddToCartButton item={item} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}
