<template>
  <div class="hello">
    <h1>Loading: {{ loading?'loading':'not loading' }}</h1>
    <h1>Error: {{ error&&error.message }}</h1>
    <h1>Book: {{ book }}</h1>
    <h1>Books: {{ books }}</h1>
    <h1>computed count+1: {{ countPlusOne }}</h1>
  </div>
</template>

<script lang="ts">
import { useBookInject } from '@/context';
import { defineComponent, onMounted } from '@vue/composition-api';

export default defineComponent({
  name: 'ProvideInjectExample',
  setup() {
    const {
      book,
      setBookCount,
      getBooks,
      books,
      loading,
      error, setBookTitle, countPlusOne,
    } = useBookInject();

    onMounted(async () => {
      let count = 0;
      setInterval(() => {
        setBookCount((count += 1));
        setBookTitle('new title');
      }, 2000);
      await getBooks('test');
    });

    return {
      book,
      books,
      loading,
      error,
      countPlusOne,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
