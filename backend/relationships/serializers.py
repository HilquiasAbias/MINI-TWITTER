from rest_framework import serializers
from relationships.models import Relationship
from users.serializers import UserSerializer
from django.contrib.auth.models import User

class RelationshipSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    followed = UserSerializer(read_only=True)
    
    class Meta:
        model = Relationship
        fields = ['id', 'follower', 'followed', 'created_at']

class FollowSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(write_only=True)

class RelationshipStatsSerializer(serializers.Serializer):
    user = UserSerializer(read_only=True)
    followers_count = serializers.IntegerField(read_only=True)
    following_count = serializers.IntegerField(read_only=True)
    is_following = serializers.SerializerMethodField(read_only=True)
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Relationship.objects.check_is_following(
                request.user.id, 
                obj['user'].id
            )
        return False