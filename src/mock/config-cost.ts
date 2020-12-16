// step, claim, request, claim event, request event
// 700,701,702,703,704

import { ConfigCostBaseNode } from '@/types/config-cost';

export const configCostList1 = [
  {
    id: 1,
    processId: 101,
    name: '阶段1',
    type: null,
    cardList: null,
    children: [
      {
        id: 1,
        processId: 101,
        name: '步骤1',
        type: 700,
        cardList: [
          {
            id: 1, // number; // 312,
            name: '', // string; // "递交申请-填写委托信息",
            estimateType: 3, // number; // 3, // 定稿预估
            feeItems: [
              { id: 1, name: '申请费' },
              { id: 2, name: '代理费' },
              { id: 3, name: '代理费2' },
            ],

            source: {
              id: 1,
              name: '递交申请-填写委托信息',
              estimateType: 2,
              feeItems: [
                { id: 1, name: '申请费' },
                { id: 2, name: '代理费' },
              ],
              source: null,
            },
          },
          {
            id: 2, // number; // 312,
            name: '', // string; // "递交申请-填写委托信息",
            estimateType: 2, // number; // 3, // 定稿预估
            feeItems: [
              { id: 1, name: '申请费' },
              { id: 2, name: '代理费' },
              { id: 3, name: '代理费2' },
            ],

            source: {
              id: 1,
              name: '递交申请-填写委托信息',
              estimateType: 1,
              feeItems: [
                { id: 1, name: '申请费' },
                { id: 2, name: '代理费' },
              ],
              source: null,
            },
          },
          {
            id: 3, // number; // 312,
            name: '', // string; // "递交申请-填写委托信息",
            estimateType: 1, // number; // 3, // 定稿预估
            feeItems: [
              { id: 1, name: '申请费' },
              { id: 2, name: '代理费' },
              { id: 3, name: '代理费2' },
            ],

            source: null,
          },
        ],
        children: [],
      },
      {
        id: 2,
        processId: 101,
        name: '步骤2',
        type: 700,
        cardList: [],
        children: [],
      },
      {
        id: 2,
        processId: 101,
        name: '来文1',
        type: 701,
        cardList: [],
        children: [
          {
            id: 1,
            processId: 101,
            name: '来文答辩/事件1',
            type: 703,
            cardList: [],
            children: [],
          },
          {
            id: 2,
            processId: 101,
            name: '来文答辩/事件2',
            type: 703,
            cardList: [],
            children: [],
          },
        ],
      },
      {
        id: 3,
        processId: 101,
        name: '来文2',
        type: 701,
        cardList: [],
        children: null,
      },
      {
        id: 4,
        processId: 101,
        name: '请求1',
        type: 702,
        cardList: [],
        children: [
          {
            id: 1,
            processId: 101,
            name: '请求答辩/事件1',
            type: 704,
            cardList: [],
            children: [],
          },
          {
            id: 2,
            processId: 101,
            name: '请求答辩/事件2',
            type: 704,
            cardList: [],
            children: [],
          },
        ],
      },
      {
        id: 5,
        processId: 101,
        name: '请求2',
        type: 702,
        cardList: [],
        children: [],
      },
    ],
  },
  {
    id: 2,
    processId: 101,
    name: '阶段2',
    type: null,
    cardList: null,
    children: [],
  },
];

export const configCostList: ConfigCostBaseNode[] = [
  {
    processStageId: 187,
    name: '阶段1',
    processId: 209,
    stageItems: [
      {
        // 步骤
        id: 336,
        name: '步骤1',
        processId: 209,
        processStageId: 187,
        stepClaimsType: 700,
        estimationList: [
          {
            // 委托预估
            estimationType: 7001,
            feeItems: [{ id: 1, name: '申请费' }],
            source: null,
          },
          {
            // 定稿预估
            estimationType: 7002,
            feeItems: [{ id: 1, name: '申请费' }],
            source: {
              // 流程-阶段-id（来文，请求，步骤，来文事件，请求事件）-类型-预估类型
              // 一个可以定位到费用节点里card的id
              id: '1-2-3-701-5',
              name: '递交申请-填写委托信息',
              feeItems: [{ id: 1, name: '申请费' }],
              estimationType: 7001,
            },
          },
          {
            // 账单确认
            estimationType: 7003,
            feeItems: [{ id: 1, name: '申请费' }],
            source: {
              id: '1-2-3-701-5',
              name: '递交申请-填写委托信息',
              feeItems: [{ id: 1, name: '申请费' }],
              estimationType: 7002,
            },
          },
        ],
        stageItems: null,
      },
      {
        // 来文
        id: 336,
        name: '来文1',
        processId: 209,
        processStageId: 187,
        stepClaimsType: 701,
        estimationList: [
          {
            // 委托预估
            estimationType: 7001,
            feeItems: [{ id: 1, name: '申请费' }],
            source: null,
          },
          {
            // 定稿预估
            estimationType: 7002,
            feeItems: [{ id: 1, name: '申请费' }],
            source: {
              // 流程-阶段-id（来文，请求，步骤，来文事件，请求事件）-类型-预估类型
              // 一个可以定位到费用节点里card的id
              id: '1-2-3-701-5',
              name: '递交申请-填写委托信息',
              feeItems: [{ id: 1, name: '申请费' }],
              estimationType: 7001,
            },
          },
          {
            // 账单确认
            estimationType: 7003,
            feeItems: [{ id: 1, name: '申请费' }],
            source: {
              id: '1-2-3-701-5',
              name: '递交申请-填写委托信息',
              feeItems: [{ id: 1, name: '申请费' }],
              estimationType: 7002,
            },
          },
        ],
        stageItems: [
          {
            // 事件
            id: 336,
            name: '来文事件1',
            processId: 209,
            processStageId: 187,
            stepClaimsType: 703,
            estimationList: [
              {
                // 委托预估
                estimationType: 7001,
                feeItems: [{ id: 1, name: '申请费' }],
                source: null,
              },
              {
                // 定稿预估
                estimationType: 7002,
                feeItems: [{ id: 1, name: '申请费' }],
                source: {
                  // 流程-阶段-id（来文，请求，步骤，来文事件，请求事件）-类型-预估类型
                  // 一个可以定位到费用节点里card的id
                  id: '1-2-3-701-5',
                  name: '递交申请-填写委托信息',
                  feeItems: [{ id: 1, name: '申请费' }],
                  estimationType: 7001,
                },
              },
              {
                // 账单确认
                estimationType: 7003,
                feeItems: [{ id: 1, name: '申请费' }],
                source: {
                  id: '1-2-3-701-5',
                  name: '递交申请-填写委托信息',
                  feeItems: [{ id: 1, name: '申请费' }],
                  estimationType: 7002,
                },
              },
            ],
            stageItems: null,
          },
          {
            // 事件
            id: 337,
            name: '来文事件2',
            processId: 209,
            processStageId: 187,
            stepClaimsType: 703,
            estimationList: null,
            stageItems: null,
          },
        ],
      },
      {
        // 来文
        id: 337,
        name: '来文2',
        processId: 209,
        processStageId: 187,
        stepClaimsType: 701,
        estimationList: null,
        stageItems: null,
      },
      {
        // 请求
        id: 338,
        name: '请求1',
        processId: 209,
        processStageId: 187,
        stepClaimsType: 702,
        estimationList: [
          {
            // 委托预估
            estimationType: 7001,
            feeItems: [{ id: 1, name: '申请费' }],
            source: null,
          },
          {
            // 定稿预估
            estimationType: 7002,
            feeItems: [{ id: 1, name: '申请费' }],
            source: {
              // 流程-阶段-id（来文，请求，步骤，来文事件，请求事件）-类型-预估类型
              // 一个可以定位到费用节点里card的id
              id: '1-2-3-701-5',
              name: '递交申请-填写委托信息',
              feeItems: [{ id: 1, name: '申请费' }],
              estimationType: 7001,
            },
          },
          {
            // 账单确认
            estimationType: 7003,
            feeItems: [{ id: 1, name: '申请费' }],
            source: {
              id: '1-2-3-701-5',
              name: '递交申请-填写委托信息',
              feeItems: [{ id: 1, name: '申请费' }],
              estimationType: 7002,
            },
          },
        ],
        stageItems: [
          {
            // 请求答辩步骤/请求事件
            id: 336,
            name: '请求答辩步骤/请求事件1',
            processId: 209,
            processStageId: 187,
            stepClaimsType: 704,
            estimationList: [
              {
                // 委托预估
                estimationType: 7001,
                feeItems: [{ id: 1, name: '申请费' }],
                source: null,
              },
              {
                // 定稿预估
                estimationType: 7002,
                feeItems: [{ id: 1, name: '申请费' }],
                source: {
                  // 流程-阶段-id（来文，请求，步骤，来文事件，请求事件）-类型-预估类型
                  // 一个可以定位到费用节点里card的id
                  id: '1-2-3-701-5',
                  name: '递交申请-填写委托信息',
                  feeItems: [{ id: 1, name: '申请费' }],
                  estimationType: 7001,
                },
              },
              {
                // 账单确认
                estimationType: 7003,
                feeItems: [{ id: 1, name: '申请费' }],
                source: {
                  id: '1-2-3-701-5',
                  name: '递交申请-填写委托信息',
                  feeItems: [{ id: 1, name: '申请费' }],
                  estimationType: 7002,
                },
              },
            ],
            stageItems: null,
          },
          {
            // 事件
            id: 337,
            name: '请求答辩步骤/请求事件2',
            processId: 209,
            processStageId: 187,
            stepClaimsType: 704,
            estimationList: null,
            stageItems: null,
          },
        ],
      },
      {
        // 请求
        id: 337,
        name: '请求2',
        processId: 209,
        processStageId: 187,
        stepClaimsType: 702,
        estimationList: null,
        stageItems: null,
      },
    ],
  },
  {
    processStageId: 188,
    name: '阶段2',
    processId: 209,
    stageItems: null,
  },
];
