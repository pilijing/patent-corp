<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
   </div>
</template>

<script lang="ts">

import { defineComponent } from '@vue/composition-api';

interface ComplexMessage {
  title: string;
  okMessage: string;
  cancelMessage: string;
}
interface Props{
    title: string;
    likes: number;
    isPublished: boolean;

}
export default defineComponent<Props>({
  name: 'Test',
  props: {
    title: String,
    likes: Number,
    isPublished: Boolean,
    commentIds: Array,
    author: Object,
    callback: Function,
    contactsPromise: Promise, // or any other constructor
    message: {
      // type: Object as PropType<ComplexMessage>,
      type: Object,
      required: true,
      validator(message: ComplexMessage) {
        return !!message.title;
      },
    },
  },

  setup() {
    // generic type  范型
    function hello<T>(name: T): T {
      return name;
    }
    let a = '';
    a = hello<string>('1');

    interface UserInfo{
      name: string;
      id: string;
      age: number;
    }
    function getUserInfo(): UserInfo {
      return {
        name: 'kai',
        id: '123',
        age: 18,
      };
    }
    const userInfo: UserInfo = {
      name: 'kai',
      id: '123',
      age: 18,
    };

    const { name, id, ...rest } = userInfo;

    const data = {
      user: {
        name: {
          firstname: 'haha',
        },
      },
    };
      // TypeError: cannot read property firstname of undefined
    console.log(data?.user?.name?.firstname);

    // const a = '';
    // const b = '456';
    // // const c = a || b;
    // const c = a ?? b;

   interface APIData{
    name: string[]| null;
}
   let apiData: APIData;
   apiData = { name: [] };
   apiData = { name: ['1'] };
   if (apiData.name) {
     apiData.name.map(item => (item));
   }
  },
});

</script>
