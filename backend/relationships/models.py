from django.db import models
from django.contrib.auth.models import User

class RelationshipManager(models.Manager):
    def follow_user(self, follower_id, followed_id):
        """Seguir um usuário"""
        if follower_id == followed_id:
            return False
        
        # Verificar se já segue
        if self.filter(follower_id=follower_id, followed_id=followed_id).exists():
            return False
        
        if not User.objects.filter(id=follower_id).exists() or not User.objects.filter(id=followed_id).exists():
            return False
        
        self.create(follower_id=follower_id, followed_id=followed_id)
        return True
    
    def unfollow_user(self, follower_id, followed_id):
        """Deixar de seguir um usuário"""
        try:
            relationship = self.get(follower_id=follower_id, followed_id=followed_id)
            relationship.delete()
            return True
        except self.model.DoesNotExist:
            return False
    
    def get_followers(self, user_id):
        """Obter seguidores de um usuário"""
        return User.objects.filter(following__followed_id=user_id)
    
    def get_following(self, user_id):
        """Obter usuários que um usuário segue"""
        return User.objects.filter(followers__follower_id=user_id)
    
    def check_is_following(self, follower_id, followed_id):
        """Verificar se um usuário segue outro"""
        return self.filter(follower_id=follower_id, followed_id=followed_id).exists()
    
    def get_followers_count(self, user_id):
        """Obter contagem de seguidores de um usuário"""
        return self.filter(followed_id=user_id).count()
        
    def get_following_count(self, user_id):
        """Obter contagem de usuários que um usuário segue"""
        return self.filter(follower_id=user_id).count()

class Relationship(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Adicionando custom manager
    objects = RelationshipManager()

    class Meta:
        unique_together = ['follower', 'followed']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} follows {self.followed.username}"