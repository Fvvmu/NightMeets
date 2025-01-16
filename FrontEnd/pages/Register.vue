<template>
  <div class="register-container">
    <h2>Rejestracja</h2>
    <form @submit.prevent="registerUser">
      <input v-model="username" type="text" placeholder="Nazwa użytkownika" required />
      <input v-model="email" type="email" placeholder="E-mail" required />
      <div class="password-container">
        <input :type="passwordFieldType" v-model="password" placeholder="Hasło" required />
        <button type="button" class="toggle-password" @click="togglePasswordVisibility">
          {{ showPassword ? 'Ukryj' : 'Pokaż' }}
        </button>
      </div>
      <button type="submit">Zarejestruj się</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);

const registerUser = async () => {
  if (!isPasswordValid(password.value)) {
    alert('Hasło musi mieć co najmniej 8 znaków, w tym jedną dużą literę, jedną małą literę, jedną cyfrę i jeden znak specjalny.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value,
    });

    const { token, role } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('username', username.value);
    localStorage.setItem('role', role);

    window.dispatchEvent(new Event("storage"));

    router.push({ path: '/', replace: true });
  } catch (error) {
    if (error.response && error.response.status === 400) {
      alert('Użytkownik z takim e-mailem lub nazwą użytkownika już istnieje. Wybierz inne dane.');
    } else {
      console.error('Błąd rejestracji:', error);
      alert('Rejestracja nie powiodła się. Sprawdź wprowadzone dane i spróbuj ponownie.');
    }
  }
};

const isPasswordValid = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'));
</script>

<style scoped lang="scss">
$primary-bg: #1a1a1a;
$button-bg: #444;
$button-hover-bg: #666;
$border-radius: 8px;
$input-padding: 10px;

.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: $primary-bg;
  color: white;
  border-radius: $border-radius;

  h2 {
    text-align: center;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    flex-direction: column;
    padding-right: 20px;

    input {
      display: block;
      width: 100%;
      margin: 10px 0;
      padding: $input-padding;
      border: none;
      border-radius: $border-radius;
      font-size: 1rem;
    }

    .password-container {
      display: flex;
      align-items: center;

      input {
        flex: 1;
      }

      .toggle-password {
        margin-left: 10px;
        padding: $input-padding;
        background-color: $button-bg;
        color: white;
        border: none;
        border-radius: $border-radius;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: $button-hover-bg;
        }
      }
    }

    button {
      padding: $input-padding;
      background-color: $button-bg;
      color: white;
      border: none;
      border-radius: $border-radius;
      cursor: pointer;
      font-size: 1.1rem;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: $button-hover-bg;
      }
    }
  }
}
</style>