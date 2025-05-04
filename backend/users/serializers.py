from rest_framework import serializers
from django.contrib.auth.models import User
from users.models import Profile
from relationships.models import Relationship

class UserSerializer(serializers.ModelSerializer):
    picture = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_follower = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'picture', 'is_following', 'is_follower']
    
    def get_picture(self, obj):
        try:
            # Verifica se o perfil existe e se tem uma imagem válida
            if hasattr(obj, 'profile') and obj.profile.picture:
                # Se picture for um ImageField, verifica se tem um arquivo associado
                if hasattr(obj.profile.picture, 'url'):
                    try:
                        return obj.profile.picture.url
                    except ValueError:  # Captura o erro quando não há arquivo associado
                        return ""
                # Se for um URLField ou string
                return obj.profile.picture
            return ""
        except Profile.DoesNotExist:
            return ""

    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Relationship.objects.filter(
                follower=request.user,
                followed=obj
            ).exists()
        return False
    
    def get_is_follower(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Relationship.objects.filter(
                follower=obj,
                followed=request.user
            ).exists()
        return False

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['user', 'bio', 'picture', 'picture_url', 'created_at', 'updated_at']
    
    def get_picture_url(self, obj):
        if obj.picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.picture.url)
            return obj.picture.url
        return ""



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não correspondem"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create_profile(user=user)
        return user

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'picture']