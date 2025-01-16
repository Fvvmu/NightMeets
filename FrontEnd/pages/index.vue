<template>
  <div class="main-page">
    <div class="map-container">
      <MapComponent />
    </div>
  </div>
</template>

<script setup>
import MapComponent from '~/components/MapComponent.vue';
</script>

<style scoped lang="scss">
$map-bg-color: lightgray;
$map-border-color: white;

.main-page {
  display: flex;
  flex-direction: row;
  height: auto;
}

.map-container {
  width: 100%;
}

.chat-container {
  width: 30%;
  height: 100%;
  padding-left: 10px;
  height: px;
  background-color: $map-bg-color;
  border: 5px solid $map-border-color;
  flex-direction: column;
}
</style>