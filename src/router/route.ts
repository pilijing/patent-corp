/* eslint-disable function-paren-newline */
/**
 * 业务页面路由
 */
const mainRouter = [
  {
    path: '',
    redirect: '/patent-application',
  },
  {
    path: '/patent-application',
    name: 'patentApplication',
    component: () => import('@/views/pages/patent-application/index.vue'),
  },
  {
    path: '/first-application',
    name: 'firstApplication',
    component: () => import('@/views/pages/patent-application/first-application/index.vue'),
  },
  {
    path: '/first-application/detail',
    name: 'firstApplicationDetail',
    component: () => import('@/views/pages/patent-application/first-application/detail.vue'),
  },
  {
    path: '/dashboard/todo',
    name: 'dashboardTodo',
    component: () => import('@/views/pages/dashboard/todo.vue'),
  },
  {
    path: '/bill-management/unbilled',
    name: 'dashboardUnbilled',
    component: () => import('@/views/pages/dashboard/unbilled.vue'),
  },
  {
    path: '/dashboard/done',
    name: 'dashboardDone',
    component: () => import('@/views/pages/dashboard/done.vue'),
  },
  {
    path: '/dashboard/my-patent',
    name: 'myPatent',
    component: () => import('@/views/pages/dashboard/my-patent-list.vue'),
  },
  {
    path: '/dashboard/patent-detail',
    name: 'patentDetail',
    component: () => import('@/views/pages/dashboard/patent-detail.vue'),
  },
  {
    path: '/patent-application/patent-view',
    name: 'patentApplicationPatentView',
    component: () => import('@/views/pages/patent-application/patent-view.vue'),
  },
  {
    path: '/dashboard/pct-international-list',
    name: 'PctInternationalList',
    component: () => import('@/views/pages/dashboard/pct-international-list.vue'),
  },
  {
    path: '/dashboard/pct-in-country-list',
    name: 'PctInCountryList',
    component: () => import('@/views/pages/dashboard/pct-in-country-list.vue'),
  },
  {
    path: '/dashboard/pact-paris-list',
    name: 'PactParisList',
    component: () => import('@/views/pages/dashboard/pact-paris-list.vue'),
  },
  {
    path: '/dashboard/document-import',
    name: 'DocumentImport',
    component: () => import('@/views/pages/dashboard/document-import.vue'),
  },
  {
    path: '/backstage-management/process-definition',
    name: 'backstageManagementProcessDefinition',
    component: () => import('@/views/pages/backstage-management/process-configuration/process-definition.vue'),
  },
  {
    path: '/backstage-management/process-view',
    name: 'backstageManagementProcessView',
    component: () => import('@/views/pages/backstage-management/process-configuration/process-view.vue'),
  },
  {
    path: '/backstage-management/engineer-list',
    name: 'backstageManagementEngineerList',
    component: () => import('@/views/pages/backstage-management/patent-engineer/engineer-list.vue'),
  },
  {
    path: '/proxy-management/agent-detail',
    name: 'backstageManagementAgentDetail',
    component: () => import('@/views/pages/proxy-management/agency/agent-detail.vue'),
  },
  {
    path: '/proxy-management/agent-list',
    name: 'backstageManagementAgentList',
    component: () => import('@/views/pages/proxy-management/agency/agent-list.vue'),
  },
  {
    path: '/proxy-management/agency-management',
    name: 'AgencyManagement',
    component: () => import('@/views/pages/proxy-management/proxy/agency-management.vue'),
  },
  {
    path: '/proxy-management/add-agency',
    name: 'addAgency',
    component: () => import('@/views/pages/proxy-management/proxy/add-agency.vue'),
  },
  {
    path: '/proxy-management/edit-agency',
    name: 'editAgency',
    component: () => import('@/views/pages/proxy-management/proxy/edit-agency.vue'),
  },
  {
    path: '/proxy-management/agency-detail',
    name: 'backstageManagementAgencyDetail',
    component: () => import('@/views/pages/proxy-management/proxy/agency-detail.vue'),
  },
  {
    path: '/proxy-management/add-agency-information',
    name: 'AgencyManagementInformation',
    component: () => import('@/views/pages/proxy-management/proxy/add-agency-information.vue'),
  },
  {
    path: '/backstage-management/reviewer-list',
    name: 'reviewerList',
    component: () => import('@/views/pages/backstage-management/reviewer-configuration/reviewer-list.vue'),
  },
  {
    path: '/corp-management/corp-list',
    name: 'CorpList',
    component: () => import('@/views/pages/corp-management/corp/corp-list.vue'),
  },
  {
    path: '/corp-management/corp-detail',
    name: 'CorpDetail',
    component: () => import('@/views/pages/corp-management/corp/detail.vue'),
  },
  {
    path: '/corp-management/staff-list',
    name: 'CorpStaffList',
    component: () => import('@/views/pages/corp-management/corp-staff/staff-list.vue'),
  },
  {
    path: '/corp-management/staff-detail',
    name: 'CorpStaffDetail',
    component: () => import('@/views/pages/corp-management/corp-staff/detail.vue'),
  },
  {
    path: '/corp-management/group-list',
    name: 'CorpGroupList',
    component: () => import('@/views/pages/corp-management/corp-group/group-list.vue'),
  },
  {
    path: '/corp-management/role-list',
    name: 'CorpRoleList',
    component: () => import('@/views/pages/corp-management/corp-role/role-list.vue'),
  },
  {
    path: '/corp-management/permissions-list',
    name: 'PermissionsList',
    component: () => import('@/views/pages/corp-management/corp-permissions/index.vue'),
  },
  {
    path: '/corp-management/auth-add',
    name: 'PermissionsAuthAdd',
    component: () => import('@/views/pages/corp-management/corp-permissions/auth-add.vue'),
  },
  {
    path: '/fee-management/cost-allocation',
    name: 'costAllocation',
    component: () => import('@/views/pages/backstage-management/cost-allocation-management/agency-fee.vue'),
  },
  {
    path: '/fee-management/agency-fees-list',
    name: 'AgencyFeesList',
    component: () => import('@/views/pages/backstage-management/agency-fees/agency-fees-list.vue'),
  },

  {
    path: '/fee-management/process-fee',
    name: 'ProcessFeesList',
    component: () => import('@/views/pages/fee-management/process-fee.vue'),
  },
  {
    path: '/bill-management/bill-query',
    name: 'ProcessBillQuery',
    component: () => import('@/views/pages/bill-management/bill-query.vue'),
  },
];
/**
 * 费用管理路由
 */
const feeManagementRouter = [
  {
    path: '/fee-management/budget-management',
    name: 'BudgetManagement',
    // eslint-disable-next-line function-paren-newline
    component: () => import(
      /* webpackChunkName:"fee-management" */
      '@/views/pages/fee-management/budget-management.vue'),
  },
  {
    // 费用管理 - 费用环节配置
    path: '/fee-management/process-fee',
    name: 'ProcessFeesList',
    component: () => import(
      /* webpackChunkName:"fee-management" */
      '@/views/pages/fee-management/process-fee.vue'),
  },
  {
    // 费用管理 - 费用环节配置 - 费用配置
    path: '/fee-management/cost-configuration',
    name: 'CostConfiguration',
    component: () => import(
      /* webpackChunkName:"fee-management"*/
      '@/views/pages/fee-management/config-cost/config-cost.vue'),
  },
];

const billManagementRouter = [
  {
    path: '/bill-management/bill-check',
    name: 'BillCheck',
    component: () => import(
      /* webpackChunkName: "bill-management" */
      '@/views/pages/bill-management/bill-check.vue'),
  },
  {
    path: '/bill-management/bill-review',
    name: 'BillReview',
    component: () => import(
      /* webpackChunkName: "bill-management" */
      '@/views/pages/bill-management/bill-review.vue'),
  },
  {
    path: '/bill-management/payment-approval',
    name: 'PaymentApproval',
    component: () => import(
      /* webpackChunkName: "bill-management" */
      '@/views/pages/bill-management/payment-approval.vue'),
  },
  {
    path: '/bill-management/bill-voucher',
    name: 'BillVoucher',
    component: () => import(
      /* webpackChunkName: "bill-management" */
      '@/views/pages/bill-management/bill-voucher.vue'),
  },
  {
    path: '/bill-management/payment-complete',
    name: 'PaymentComplete',
    component: () => import(
      /* webpackChunkName: "bill-management" */
      '@/views/pages/bill-management/payment-complete.vue'),
  },
];

const exampleRouter = [
  {
    path: '/example/list-table',
    name: 'exampleListTable',
    component: () => import(/* webpackChunkName:"sample" */ '@/views/pages/example/list-table.vue'),
  },
  {
    path: '/example/provide-inject',
    name: 'ProvideInjectExample',
    component: () => import(/* webpackChunkName:"sample" */ '@/views/pages/example/provide-inject.vue'),
  },
  {
    path: '/example/details',
    name: 'exampleDetails',
    component: () => import(/* webpackChunkName:"sample" */ '@/views/pages/example/details.vue'),
  },
  {
    path: '/example/bigsea',
    name: 'exampleBigsea',
    component: () => import(/* webpackChunkName:"sample" */ '@/views/pages/example/bigsea.vue'),
  },
];

export default [...mainRouter, ...feeManagementRouter, ...billManagementRouter, ...exampleRouter];
