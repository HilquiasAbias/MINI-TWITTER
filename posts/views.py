from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from posts.models import Post, Like
from posts.serializers import (
    PostSerializer,
    PostCreateSerializer,
    PostUpdateSerializer
)

class StandardPostsResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = PostCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save()
            result = PostSerializer(post, context={'request': request})
            return Response(result.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            serializer = PostSerializer(post, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({"message": "Post não encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id, user=request.user)
            serializer = PostUpdateSerializer(post, data=request.data)
            if serializer.is_valid():
                post = serializer.save()
                result = PostSerializer(post, context={'request': request})
                return Response(result.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({"message": "Post não encontrado ou você não tem permissão"}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id, user=request.user)
            post.delete()
            return Response({"message": "Post excluído com sucesso"}, status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response({"message": "Post não encontrado ou você não tem permissão"}, status=status.HTTP_404_NOT_FOUND)

class FeedView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        posts = Post.objects.get_feed_posts(request.user.id)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class PostLikeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        is_liked = Like.objects.filter(user=request.user, post_id=post_id).exists()
        
        if is_liked:
            # Descurtir
            Like.objects.unlike_post(request.user.id, post_id)
            return Response({"liked": False}, status=status.HTTP_200_OK)
        else:
            # Curtir
            success = Like.objects.like_post(request.user.id, post_id)
            if success:
                return Response({"liked": True}, status=status.HTTP_200_OK)
            return Response({"message": "Post não encontrado"}, status=status.HTTP_404_NOT_FOUND)

class UserPostsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        posts = Post.objects.get_user_posts(user_id)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)