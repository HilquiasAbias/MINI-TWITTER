from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from relationships.models import Relationship
from users.serializers import UserSerializer
from relationships.serializers import RelationshipSerializer, RelationshipStatsSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class FollowUnfollowView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        """Seguir ou deixar de seguir um usuário"""
        try:
            # Verificar se o usuário a ser seguido existe
            get_object_or_404(User, id=user_id)
            
            if request.user.id == user_id:
                return Response(
                    {"message": "Você não pode seguir a si mesmo"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            is_following = Relationship.objects.check_is_following(request.user.id, user_id)
            
            if is_following:
                # Deixar de seguir
                Relationship.objects.unfollow_user(request.user.id, user_id)
                return Response({"following": False}, status=status.HTTP_200_OK)
            else:
                # Seguir
                success = Relationship.objects.follow_user(request.user.id, user_id)
                if success:
                    return Response({"following": True}, status=status.HTTP_200_OK)
                    
                return Response(
                    {"message": "Não foi possível seguir o usuário"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except User.DoesNotExist:
            return Response(
                {"message": "Usuário não encontrado"}, 
                status=status.HTTP_404_NOT_FOUND
            )

class FollowersListView(ListAPIView):
    """Lista paginada de seguidores de um usuário"""
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        # Verificar se o usuário existe
        get_object_or_404(User, id=user_id)
        return Relationship.objects.get_followers(user_id)

class FollowingListView(ListAPIView):
    """Lista paginada de usuários que um usuário segue"""
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        # Verificar se o usuário existe
        get_object_or_404(User, id=user_id)
        return Relationship.objects.get_following(user_id)

class CheckFollowStatusView(APIView):
    """Verificar se o usuário autenticado segue outro usuário"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        # Verificar se o usuário existe
        get_object_or_404(User, id=user_id)
        
        is_following = Relationship.objects.check_is_following(request.user.id, user_id)
        return Response({"is_following": is_following}, status=status.HTTP_200_OK)

class RelationshipStatsView(APIView):
    """Obter estatísticas de seguidores e seguidos de um usuário"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        # Verificar se o usuário existe
        user = get_object_or_404(User, id=user_id)
        
        followers_count = Relationship.objects.get_followers_count(user_id)
        following_count = Relationship.objects.get_following_count(user_id)
        
        data = {
            'user': user,
            'followers_count': followers_count,
            'following_count': following_count
        }
        
        serializer = RelationshipStatsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)