from django.urls import path
from posts.views import (
    PostListCreateView,
    PostDetailView,
    FeedView,
    PostLikeView,
    UserPostsView
)

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post-list-create'),
    path('feed/', FeedView.as_view(), name='feed'),
    path('<int:post_id>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:post_id>/like/', PostLikeView.as_view(), name='post-like'),
    path('user/<int:user_id>/', UserPostsView.as_view(), name='user-posts'),
]