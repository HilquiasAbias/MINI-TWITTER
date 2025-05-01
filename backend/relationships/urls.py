from django.urls import path
from relationships.views import (
    FollowUnfollowView,
    FollowersListView,
    FollowingListView,
    CheckFollowStatusView,
    RelationshipStatsView
)

urlpatterns = [
    path('follow/<int:user_id>/', FollowUnfollowView.as_view(), name='follow-unfollow'),
    path('followers/<int:user_id>/', FollowersListView.as_view(), name='followers'),
    path('following/<int:user_id>/', FollowingListView.as_view(), name='following'),
    path('check-follow/<int:user_id>/', CheckFollowStatusView.as_view(), name='check-follow'),
    path('stats/<int:user_id>/', RelationshipStatsView.as_view(), name='relationship-stats'),
]