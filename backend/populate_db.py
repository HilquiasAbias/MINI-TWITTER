#!/usr/bin/env python
import os
import sys
import django
import random
from pathlib import Path
from django.core.files.images import ImageFile

# Configurar o ambiente Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mini_twitter.settings')
django.setup()

# Importar modelos após configurar o Django
from django.contrib.auth.models import User
from users.models import Profile
from posts.models import Post

# Frases genéricas para os posts
POST_CONTENTS = [
    "Acabei de descobrir algo incrível! #empolgado",
    "Compartilhando um momento especial com vocês.",
    "Pensamentos aleatórios em um dia comum.",
    "Não acredito no que acabei de ver! 😮",
    "Alguém mais está acompanhando isso?",
    "Novo dia, novas oportunidades! #motivação",
    "Às vezes a vida nos surpreende de maneiras inesperadas.",
    "Momentos como este que fazem tudo valer a pena.",
    "Reflexões de uma tarde de domingo.",
    "Compartilhando um pouco da minha rotina com vocês.",
    "Aprendendo algo novo todos os dias!",
    "A vista daqui é simplesmente incrível!",
    "Algumas experiências mudam nossa perspectiva para sempre.",
    "Pequenas coisas que fazem toda a diferença.",
    "Quando a realidade supera as expectativas.",
]

def create_user_and_posts(username, mock_dir):
    """Cria um usuário com perfil e posts baseados nos arquivos da pasta mock"""
    print(f"Criando usuário: {username}")
    
    # Verificar se o usuário já existe
    if User.objects.filter(username=username).exists():
        print(f"Usuário {username} já existe. Pulando...")
        return
    
    # Criar usuário
    user = User.objects.create_user(
        username=username,
        email=f"{username}@example.com",
        password="senhapadrao"
    )
    
    # Criar ou obter perfil para o usuário
    profile, created = Profile.objects.get_or_create(user=user)
    if created:
        print(f"Perfil criado para o usuário {username}")
    else:
        print(f"Perfil existente encontrado para o usuário {username}")
    
    # Obter caminho da imagem de perfil
    profile_img_path = mock_dir / "perfil.jpeg"
    if not profile_img_path.exists():
        # Tentar outras extensões comuns
        for ext in ['jpg', 'png']:
            alt_path = mock_dir / f"perfil.{ext}"
            if alt_path.exists():
                profile_img_path = alt_path
                break
    
    # Atualizar perfil com a imagem
    if profile_img_path.exists():
        with open(profile_img_path, 'rb') as img_file:
            profile.picture.save(
                f"{username}_profile{profile_img_path.suffix}",
                ImageFile(img_file),
                save=True
            )
            print(f"Perfil atualizado com imagem: {profile_img_path}")
    else:
        print(f"Imagem de perfil não encontrada para {username} em {mock_dir}")
    
    # Criar posts para o usuário
    post_images = list(mock_dir.glob("post*.jpeg")) or list(mock_dir.glob("post*.jpg")) or list(mock_dir.glob("post*.png"))
    
    for img_path in post_images:
        # Escolher um conteúdo aleatório para o post
        content = random.choice(POST_CONTENTS)
        
        # Criar o post - CORRIGIDO: usar 'user' em vez de 'author'
        post = Post(user=user, content=content)
        post.save()
        
        # Adicionar imagem ao post
        with open(img_path, 'rb') as img_file:
            post.image.save(
                f"{username}_post_{img_path.name}",
                ImageFile(img_file),
                save=True
            )
        
        print(f"Post criado para {username} com imagem: {img_path.name}")

def main():
    # Caminho para a pasta mock
    mock_path = Path(__file__).resolve().parent / "mock"
    
    if not mock_path.exists():
        print(f"Pasta mock não encontrada em: {mock_path}")
        print(f"Diretório atual: {Path.cwd()}")
        print(f"Conteúdo do diretório: {os.listdir(Path.cwd())}")
        return
    
    print(f"Usando pasta mock: {mock_path}")
    print(f"Conteúdo da pasta mock: {os.listdir(mock_path)}")
    
    # Iterar sobre as pastas de usuários
    for user_dir in [d for d in mock_path.iterdir() if d.is_dir()]:
        username = user_dir.name
        print(f"Processando diretório de usuário: {user_dir}")
        print(f"Conteúdo do diretório: {os.listdir(user_dir)}")
        create_user_and_posts(username, user_dir)
    
    print("Processo de população do banco de dados concluído!")

if __name__ == "__main__":
    main()
