<template>
  <div class="all-contact">
    <div class="contact-content">

      <form class="contact-form" @submit.prevent="sendMessage">
        <h1 class="form-header">Formularz Kontaktowy</h1>
        <div class="separator"></div>

        <label for="name">Imię:</label>
        <input type="text" id="name" v-model="formData.name" name="name" required />

        <label for="email">E-mail:</label>
        <input type="email" id="email" v-model="formData.email" name="email" required />

        <label for="message">Wiadomość:</label>
        <textarea id="message" v-model="formData.message" name="message" rows="5" required></textarea>

        <button type="submit" class="send-button">Wyślij</button>
      </form>

      <div class="social-media">
        <h1 class="social-header">Social Media</h1>
        <div class="separator"></div>

        <a href="https://www.facebook.com/NightMeetsEU/" target="_blank">
          <i class="fab fa-facebook"></i> Facebook
        </a>
        <a href="https://www.instagram.com/n1ghtmeetseu/" target="_blank">
          <i class="fab fa-instagram"></i> Instagram
        </a>
        <a href="https://www.tiktok.com/@nightmeets.eu" target="_blank">
          <i class="fab fa-tiktok"></i> TikTok
        </a>
        <a href="https://x.com/NightMeetsEU" target="_blank">
          <i class="fab fa-x-twitter"></i> X
        </a>
        <a href="mailto:nightmeetseu@gmail.com">
          <i class="fas fa-envelope"></i> E-mail
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const formData = ref({
  name: '',
  email: '',
  message: ''
});

const sendMessage = async () => {
  try {
    await axios.post('http://localhost:5000/api/send-email', formData.value);
    alert('Wiadomość została wysłana pomyślnie!');
    formData.value = {
      name: '',
      email: '',
      message: ''
    };
  } catch (error) {
    console.error('Błąd przy wysyłaniu wiadomości:', error);
    alert('Wystąpił błąd przy wysyłaniu wiadomości. Spróbuj ponownie.');
  }
};

onMounted(() => {
  const script = document.createElement('script');
  script.src = "https://kit.fontawesome.com/821407534c.js";
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
});
</script>

<style scoped lang="scss">
$contact-bg-color: #444;
$hover-bg-color: #666;
$separator-color: white;
$social-hover-color: purple;
$input-border-color: #ccc;
$border-radius: 4px;

.all-contact {
  width: 100%;
}

.contact-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  
}

.form-header, .social-header {
  font-size: 2rem;
  margin-bottom: 10px;
}

.separator {
  border-bottom: 1px solid $separator-color;
  margin-bottom: 20px;
}

.contact-form {
  width: 45%;
  text-align: left;

  label {
    font-size: 1.2rem;
  }

  input, textarea {
    width: 98%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid $input-border-color;
    border-radius: $border-radius;
    font-size: 1rem;
  }

  textarea {
    resize: vertical;
    width: 98%;
  }

  .send-button {
    background-color: $contact-bg-color;
    color: white;
    padding: 15px;
    border: none;
    border-radius: $border-radius;
    cursor: pointer;
    font-size: 1.2rem;
    width: 100%;

    &:hover {
      background-color: $hover-bg-color;
    }
  }
}

.social-media {
  width: 45%;
  font-size: 30px;
  text-align: left;

  a {
    color: white;
    text-decoration: none;
    margin: 15px 0;
    display: flex;
    align-items: center;

    i {
      margin-right: 10px;
    }

    &:hover {
      color: $social-hover-color;
    }
  }
}
</style>
