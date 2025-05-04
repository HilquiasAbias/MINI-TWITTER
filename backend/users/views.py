from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from users.models import Profile
from users.serializers import (
    RegisterSerializer, 
    UserSerializer, 
    ProfileSerializer,
    ProfileUpdateSerializer
)

class StandardUsersResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customização do serializer de tokens para incluir informações adicionais do usuário
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token
        
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user_id'] = user.id
        data['username'] = user.username
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """View customizada para obtenção de tokens"""
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuário registrado com sucesso"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"message": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        print("Dados recebidos:", request.data)
        print("Arquivos recebidos:", request.FILES)
        
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        print("Erros de validação:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SearchUsersView(ListAPIView):
    serializer_class = UserSerializer
    pagination_class = StandardUsersResultsSetPagination
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        return Profile.objects.search_users(query)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


