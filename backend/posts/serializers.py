from rest_framework import serializers
from posts.models import Post, Like
from users.serializers import UserSerializer

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'image', 'created_at', 'updated_at', 'likes_count', 'is_liked']
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_image(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image']
    
    def create(self, validated_data):
        user = self.context['request'].user
        return Post.objects.create(user=user, **validated_data)

class PostUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image']