from rest_framework import serializers
from .models import Category, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "url", "alt_text", "is_primary", "sort_order")


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image_url", "sort_order", "is_active", "product_count", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    images = ProductImageSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = ("id", "category", "category_name", "category_slug", "name", "slug", "description", "short_description", "price", "compare_at_price", "stock", "tags", "is_featured", "is_active", "images", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        product = Product.objects.create(**validated_data)
        ProductImage.objects.bulk_create([ProductImage(product=product, **image) for image in images])
        return product

    def update(self, instance, validated_data):
        images = validated_data.pop("images", None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        if images is not None:
            instance.images.all().delete()
            ProductImage.objects.bulk_create([ProductImage(product=instance, **image) for image in images])
        return instance
