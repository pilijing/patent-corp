<template>
  <div class="index">
    <page-card>
      <div class="page-card">
        <page-card style="width: 66%;">
          <div class="header">首次申请</div>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div
                v-for="(item, index) in list1"
                :key="item.id"
                class="list-desc"
              >
                <span class="block" />
                {{ index + 1 }}. {{item.desc }}
              </div>
              <span
                class="footer"
                @click="$router.push({ path: '/first-application', query: { type: 101 } })">去申请 >></span>
            </div>
            <img
              src="~@/assets/apply-logo.png"
              alt=""
              width="200"
              height="174"
            />
          </div>
        </page-card>
        <page-card style="width: 32%;">
          <div class="header">直接PCT国际</div>
          <div
            v-for="(item, index) in list2"
            :key="item.id"
            class="list-desc"
          >
            <span class="block" />
            {{ index + 1 }}. {{item.desc }}
          </div>
          <span class="footer" @click="$router.push({ path: '/first-application', query: { type: 102 } })">去申请 >></span>
        </page-card>
      </div>
      <div class="page-card">
        <page-card style="width: 32%;">
          <div class="header">PCT国际</div>
          <div
            v-for="(item, index) in list3"
            :key="item.id"
            class="list-desc"
          >
            <span class="block" />
            {{ index + 1 }}. {{item.desc }}
          </div>
          <span class="footer" @click="$router.push('/dashboard/pct-international-list')">去申请 >></span>
        </page-card>
        <page-card style="width: 32%;">
          <div class="header">PCT进国家</div>
          <div
            v-for="(item, index) in list4"
            :key="item.id"
            class="list-desc"
          >
            <span class="block" />
            {{ index + 1 }}. {{item.desc }}
          </div>
          <span class="footer" @click="$router.push('/dashboard/pct-in-country-list')">去申请 >></span>
        </page-card>
        <page-card style="width: 32%;">
          <div class="header">巴黎公约</div>
          <div
            v-for="(item, index) in list5"
            :key="item.id"
            class="list-desc"
          >
            <span class="block" />
            {{ index + 1 }}. {{item.desc }}
          </div>
          <span class="footer" @click="$router.push('/dashboard/pact-paris-list')">去申请 >></span>
        </page-card>
      </div>
      <div class="page-card">
        <page-card style="width: 32%;">
          <div class="header">港澳台</div>
          <div
            v-for="(item, index) in list6"
            :key="item.id"
            class="list-desc"
          >
            <span class="block" />
            {{ index + 1 }}. {{item.desc }}
          </div>
          <span class="footer">去申请 >></span>
        </page-card>
      </div>
    </page-card>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import PageCard from '@/components/page-card.vue';

export default defineComponent({
  name: 'index',
  components: { PageCard },
  setup() {
    const state = reactive({
      list1: [{
        id: 1,
        desc: '专利申请是发明人、设计人或者其他有申请权的主体向专利局提出某一发明或设计',
      }, {
        id: 2,
        desc: '提交申请书、说明书、权利要求、摘要、优先权请求',
      }, {
        id: 3,
        desc: '提出就某一发明或设计取得专利权的请求',
      }, {
        id: 4,
        desc: '授予专利的请求、发明或设计名称，申请人姓名及身份，代理人姓名及身份、签名',
      }, {
        id: 5,
        desc: '根据专利类型的不同，可分别称为发明专利申请、实用新型专利申请和外观设计专利申请',
      }],
      list2: [{
        id: 1,
        desc: '专利申请是发明人、专利局提出就某一发明或设计',
      }, {
        id: 2,
        desc: '提交申请书、说明书、权利要求、摘要、优先权请求',
      }, {
        id: 3,
        desc: '提出就某一发明或设计取得专利权的请求',
      }, {
        id: 4,
        desc: '授予专利的请身份，代理人姓名及身份、签名',
      }, {
        id: 5,
        desc: '根据专利类型的不同，可申请和外观设计专利申请',
      }],
      list3: [{
        id: 1,
        desc: '专利申请是发明人、专利局提出就某一发明或设计',
      }, {
        id: 2,
        desc: '提交申请书、说明书、权利要求、摘要、优先权请求',
      }, {
        id: 3,
        desc: '提出就某一发明或设计取得专利权的请求',
      }, {
        id: 4,
        desc: '授予专利的请身份，代理人姓名及身份、签名',
      }, {
        id: 5,
        desc: '根据专利类型的不同，可申请和外观设计专利申请',
      }],
      list4: [{
        id: 1,
        desc: '专利申请是发明人、专利局提出就某一发明或设计',
      }, {
        id: 2,
        desc: '提交申请书、说明书、权利要求、摘要、优先权请求',
      }, {
        id: 3,
        desc: '提出就某一发明或设计取得专利权的请求',
      }, {
        id: 4,
        desc: '授予专利的请身份，代理人姓名及身份、签名',
      }, {
        id: 5,
        desc: '根据专利类型的不同，可申请和外观设计专利申请',
      }],
      list5: [{
        id: 1,
        desc: '专利申请是发明人、专利局提出就某一发明或设计',
      }, {
        id: 2,
        desc: '提交申请书、说明书、权利要求、摘要、优先权请求',
      }, {
        id: 3,
        desc: '提出就某一发明或设计取得专利权的请求',
      }, {
        id: 4,
        desc: '授予专利的请身份，代理人姓名及身份、签名',
      }, {
        id: 5,
        desc: '根据专利类型的不同，可申请和外观设计专利申请',
      }],
      list6: [{
        id: 1,
        desc: '专利申请是发明人、专利局提出就某一发明或设计',
      }, {
        id: 2,
        desc: '提交申请书、说明书、权利要求、摘要、优先权请求',
      }, {
        id: 3,
        desc: '提出就某一发明或设计取得专利权的请求',
      }, {
        id: 4,
        desc: '授予专利的请身份，代理人姓名及身份、签名',
      }, {
        id: 5,
        desc: '根据专利类型的不同，可申请和外观设计专利申请',
      }],
    });

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.index {
  .page-card {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2%;
    .header {
      font-size: 18px;
    }
    .list-desc {
      margin: 10px 0;
      color: #999;
      .block {
        margin-right: 5px;
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #FF9500;
        transform: rotate(45deg);
      }
    }
    .footer {
      cursor: pointer;
      margin-top: 10px;
      color: #0079FE;
    }
  }
}
</style>
