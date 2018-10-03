<template>
    <page-layout>
      <div class="slogan">
        <container>
          <h1>A simple cron-like job scheduler for Node.js</h1>
          <button class="btn btn-primary">Getting Started</button>
        </container>
      </div>
    </page-layout>
</template>

<script>
import PageLayout from '../layouts/page-layout.vue';
import Container from '../components/container.vue';

export default {
  components: {
    PageLayout,
    Container
  }
}
</script>

<style lang="scss">
  .slogan {
    height: 300px;
    text-align: center;
    background-color: #e6e6e6;

    h1 {
      color: green;
      font-size: 40px;
      padding-top: 100px;
      font-weight: 100;
    }

    button {
      margin-top: 30px;
    }
  }
</style>

