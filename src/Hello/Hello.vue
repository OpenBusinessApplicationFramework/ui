<template>
    <Card>
        <template #title>Welcome</template>
        <template #content>
            <p class="m-0">
                Welcome to the first alpha version of this ui
            </p>
        </template>
    </Card>
</template>
<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>