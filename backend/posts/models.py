from django.db import models
from django.contrib.auth.models import User
from relationships.models import Relationship

class PostManager(models.Manager):
    def get_user_posts(self, user_id):
        """Busca todos os posts de um usuário"""
        return self.filter(user_id=user_id)
    
    def get_feed_posts(self, user_id):
        """Busca posts para o feed do usuário (posts de quem ele segue)"""
        followed_users = Relationship.objects.filter(follower_id=user_id).values_list('followed_id', flat=True)
        return self.filter(user_id__in=list(followed_users) + [user_id])

class LikeManager(models.Manager):
    def like_post(self, user_id, post_id):
        """Curtir um post"""
        try:
            post = Post.objects.get(id=post_id)
            like, created = self.get_or_create(user_id=user_id, post=post)
            return created
        except Post.DoesNotExist:
            return False
    
    def unlike_post(self, user_id, post_id):
        """Descurtir um post"""
        try:
            self.filter(user_id=user_id, post_id=post_id).delete()
            return True
        except:
            return False
    
    def get_post_likes_count(self, post_id):
        """Retorna número de curtidas de um post"""
        return self.filter(post_id=post_id).count()

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.CharField(max_length=280)
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Adicionando custom manager
    objects = PostManager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}..."

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Adicionando custom manager
    objects = LikeManager()

    class Meta:
        unique_together = ['user', 'post']

    def __str__(self):
        return f"{self.user.username} likes {self.post.id}"