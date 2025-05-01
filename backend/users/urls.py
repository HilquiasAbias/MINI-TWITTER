from django.urls import path
from users.views import (
    RegisterView,
    UserDetailView,
    UserProfileView,
    SearchUsersView,
    CustomTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='my-profile'),
    path('search/', SearchUsersView.as_view(), name='search-users'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),

    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]