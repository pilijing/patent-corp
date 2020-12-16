export function useCosUpload() {
  const cosSendRequest = (option: any) => {
    const { action } = option;
    const uri = action.split('.com/'); // 支持多文件上传
    if (typeof XMLHttpRequest === 'undefined') {
      return undefined;
    }
    const xhr = new XMLHttpRequest();
    if (xhr.upload) {
      xhr.upload.onprogress = (e: any) => {
        if (e.total > 0) {
          e.percent = e.loaded / e.total * 100;
        }
        option.onProgress(e);
      };
    }
    xhr.onerror = (e) => {
      option.onError(e);
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        const msg = `fail to put ${option.action} ${xhr.status}`;
        const err = new Error(msg) as any;
        err.status = xhr.status;
        err.method = 'put';
        option.onError(err);
      } else {
        option.onSuccess({ etag: xhr.getResponseHeader('etag'), key: uri[1] });
      }
    };
    xhr.open('put', option.action, true);
    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }
    const headers = option.headers || {};
    // eslint-disable-next-line no-restricted-syntax
    for (const item in headers) {
      // eslint-disable-next-line no-prototype-builtins
      if (headers.hasOwnProperty(item) && headers[item] !== null) {
        xhr.setRequestHeader(item, headers[item]);
      }
    }
    xhr.send(option.file);
    return xhr;
  };
  return { cosSendRequest };
}
