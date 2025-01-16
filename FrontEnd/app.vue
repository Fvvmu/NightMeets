<template>
  <div class="app-container">
<!-- Górna sekcja z logo i przyciskami -->
    <div class="top-section">
      <div class="logo">
        <img :src="logoGif" alt="Logo" class="logo-image" />
      </div>
      <div class="auth-buttons">
        <div v-if="isLoggedIn" class="user-info">
          <img :src="profilePicUrl" alt="Zdjęcie profilowe" class="profile-pic" />
          <span class="username">{{ username }}</span>
        </div>
        <button v-if="!isLoggedIn" class="login-button" @click="goToLogin">Logowanie</button>
        <button v-if="!isLoggedIn" class="register-button" @click="goToRegister">Rejestracja</button>
        <button v-if="isLoggedIn" class="panel-button" @click="goToPanel">Panel</button>
        <button v-if="isLoggedIn" class="logout-button" @click="logout">Wyloguj</button>
      </div>
    </div>

<!-- Nawigacja -->
    <Navbar class="navbar" />

<!-- Główna sekcja z treścią i czatem -->
    <div class="main-container">
      <ClientOnly>
        <div class="content-and-chat">
          <NuxtPage class="content-container" />
          <Chat class="chat-container" v-if="isLoggedIn" :messages="messages" @sendMessage="sendMessage" />
        </div>
      </ClientOnly>
    </div>

<!-- Sekcja reklamy -->
    <div class="ad-section">
      <h3>Reklama</h3>
    </div>

<!-- Stopka -->
    <footer class="footer">
      <p>&copy; 2025 - NightMeets.eu</p>
    </footer>
  </div>
</template>

<script setup>
import logoGif from '~/assets/logo.gif';
import Navbar from '~/components/Navbar.vue';
import Chat from '~/components/Chat.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { io } from 'socket.io-client';

const router = useRouter();
const isLoggedIn = ref(false);
const username = ref('Użytkownik');
const profilePicUrl = ref('');
const messages = ref([]);
let socket;

// Sprawdź status logowania
const checkLoginStatus = async () => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;

  if (isLoggedIn.value) {
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      username.value = response.data.username;
      profilePicUrl.value = response.data.profilePictureUrl || '/assets/default-profile.png';
    } catch (error) {
      console.error('Błąd podczas pobierania danych użytkownika:', error);
    }
  }
};

// Inicjalizacja Socket.IO
onMounted(() => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.src = "https://kit.fontawesome.com/821407534c.js";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

// Sprawdź status logowania
    checkLoginStatus();

    window.addEventListener('storage', () => {
      checkLoginStatus();
    });

// Konfiguracja Socket.IO
    socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Połączono z Socket.IO');
    });

    socket.on('chat message', (msg) => {
      messages.value.push(msg);
    });

    socket.on('disconnect', () => {
      console.log('Rozłączono z Socket.IO');
    });
  }
});

// Wysyłanie wiadomości
const sendMessage = (message) => {
  if (message.trim() !== '') {
    const msgData = {
      username: username.value,
      message: message,
    };
    socket.emit('chat message', msgData);
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const goToPanel = () => {
  router.push('/panel');
};

const logout = () => {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  window.dispatchEvent(new Event("storage"));
  router.push('/login');
};

</script>

<style scoped lang="scss">
$primary-bg: linear-gradient(135deg, #1a1a1a, #000000);
$button-bg: #444;
$button-hover-bg: #666;
$footer-bg: #111;
$footer-text: #aaa;
$border-color: white;

.app-container {
  background: $primary-bg;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 2px solid $border-color;

  .logo {
    flex: 1;

    .logo-image {
      max-width: 120px;
      height: auto;
    }
  }

  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .profile-pic {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid $border-color;
      }

      .username {
        font-size: 1rem;
      }
    }
  }
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: $button-bg;
  color: white;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: $button-hover-bg;
    transform: scale(1.05);
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;

  .content-and-chat {
    display: flex;
    gap: 20px;
    padding: 20px;
  
    .content-container {
      flex: 3;
      background-color: #121212;
      border-radius: 8px;
      padding: 20px;

    }

    .chat-container {
      flex: 1;
      background-color: #1a1a1a;
      border-radius: 8px;
      padding: 20px;
    }
  }
}

.ad-section {
  text-align: center;
  font-size: 1.5rem;
  color: purple;
  border-top: 2px solid $border-color;
}

.footer {
  text-align: center;
  border-top: 2px solid $border-color;
  background-color: $footer-bg;
  color: $footer-text;
}

@media (max-width: 768px) {
  .content-and-chat {
    flex-direction: column;
  }

  .auth-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>