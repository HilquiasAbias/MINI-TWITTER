from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q

class ProfileManager(models.Manager):
    def create_profile(self, user, bio='', picture=''):
        """Cria um perfil para o usuário"""
        return self.create(user=user, bio=bio, picture=picture)
    
    def update_profile(self, user_id, bio=None, picture=None):
        """Atualiza o perfil do usuário"""
        try:
            profile = self.get(user_id=user_id)
            if bio is not None:
                profile.bio = bio
            if picture is not None:
                profile.picture = picture
            profile.save()
            return profile
        except self.model.DoesNotExist:
            return None
    
    def search_users(self, query=None):
        """
        Busca usuários por nome ou username.
        Se nenhuma query for fornecida, retorna todos os usuários.
        """
        base_query = User.objects.filter(is_superuser=False)
        if query:
            return base_query.filter(
                Q(username__icontains=query) | 
                Q(first_name__icontains=query) | 
                Q(last_name__icontains=query)
            ).distinct()
        else:
            return base_query  
      
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.CharField(max_length=255, blank=True)
    picture = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = ProfileManager()

    def __str__(self):
        return f"{self.user.username}'s profile"