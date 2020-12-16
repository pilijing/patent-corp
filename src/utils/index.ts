import { CascadeType } from '@/types/common';
import dayjs from 'dayjs';
import cloneDeep from 'lodash/cloneDeep';
import {
  getToken, isExpired,
} from './auth';

/**
 * 可以用作 filter
 * yyyy 常用格式化年格式
 * @param {*} value 时间点
 * @param {*} formatter 格式化模板
 */
const dateFormat = (value: string | Date | dayjs.Dayjs | undefined, formatter: string) => {
  if (!value) return '';
  const date = dayjs(value);
  // 格式化时间
  let formatterString = 'yyyy-MM-DD';
  if (typeof formatter === 'string') {
    formatterString = formatter;
  } else if (typeof formatter === 'boolean' && formatter) {
    formatterString = 'yyyy-MM-DD HH:mm:ss';
  }
  formatterString = formatterString.replace(/yyyy/ig, 'YYYY');
  return date.format(formatterString);
};
// 0 为 not empty
const isEmpty = (val: { trim?: any; length?: any } | null | undefined) => {
  if (typeof val === 'string' && val.trim().length === 0) {
    return true;
  }
  if (val instanceof Array && val.length === 0) {
    return true;
  }
  if (typeof val === 'object' && val !== null && Object.keys(val).length === 0) {
    return true;
  }
  if (val === null || val === undefined) {
    return true;
  }
  return false;
};

// 下载附件
const getBlob = (url: string, isToken: boolean) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = () => {
    resolve(xhr.response);
  };
  if (isToken && !isExpired()) {
    const token = getToken();
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        reject(xhr.statusText);
      }
    }
  };
  xhr.send();
});

const saveAs = (blob: any, filename: string) => {
  if ((window.navigator.msSaveOrOpenBlob)) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    const body = document.querySelector('body');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // fix Firefox
    link.style.display = 'none';
    if (body) {
      body.appendChild(link);

      link.click();
      body.removeChild(link);

      window.URL.revokeObjectURL(link.href);
    }
  }
};

export function getNameFromCascadeList(
  cascadeList: CascadeType[],
  id: number,
): string {
  // eslint-disable-next-line no-restricted-syntax
  for (const cascade of cascadeList) {
    if (cascade.value === id) {
      return cascade.label;
    }
    if (Array.isArray(cascade.children) && cascade.children.length > 0) {
      const name = getNameFromCascadeList(cascade.children, id);
      if (name) return name;
    }
  }
  return '';
}

/**
 * 处理动态字段提交value
 * fields 动态字段, formData 表单model, tagList 标签特殊处理
 */
const handleFieldsSubmitVal = (fields: any = [], formData: any, tagList: any) => {
  const progressProperties = fields.map((item: { inputTypeName: string; id: string | number }) => {
    let val = '';
    if (item.inputTypeName === 'Tags') {
      val = JSON.stringify(tagList);
    } else if (item.inputTypeName === 'File' || formData[item.id] instanceof Array) {
      val = JSON.stringify(formData[item.id]);
    } else if (formData[item.id]) {
      val = JSON.stringify([formData[item.id]]);
    }
    return {
      ...item,
      value: val,
    };
  });
  return progressProperties;
};

/**
 * 数组格式转树状结构
 * @param   {array}     array
 * @param   {String}    id
 * @param   {String}    pid
 * @param   {String}    children
 * @return  {Array}
 */
type EnumsTree = {
  [key: string]: any;
};
const arrayToTree = (array: EnumsTree[], id = 'id', pid = 'pid', children = 'children') => {
  const data = cloneDeep(array) || [];
  const result: EnumsTree[] = [];
  const hash: EnumsTree = {};
  data.forEach((item, index) => {
    hash[data[index][id]] = data[index];
  });
  data.forEach((item) => {
    const hashVP = hash[item[pid]];
    if (hashVP) {
      if (!hashVP[children]) {
        hashVP[children] = [];
      }
      hashVP[children].push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};

export default {
  dateFormat,
  isEmpty,
  getBlob,
  saveAs,
  handleFieldsSubmitVal,
  arrayToTree,
};
