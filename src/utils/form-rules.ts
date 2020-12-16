export function inputValidator(errorMessage: string) {
  return (rule: any, value: any, callback: Function) => {
    if (typeof value === 'string' && value.trim() === '') {
      callback(new Error(errorMessage));
    } else {
      callback();
    }
  };
}
// common rules for input
export function getInputRules(requireMessage: string, lengthMessage?: string) {
  return [
    { required: true, message: requireMessage, trigger: 'blur' },
    {
      min: 1,
      max: 200,
      message: lengthMessage ?? '长度在 1 到 200 个字符',
      trigger: 'blur',
    },
    { validator: inputValidator(requireMessage), trigger: 'blur' },
  ];
}

// common rules for select
export function getSelectRules(errorMessage: string) {
  return [{ required: true, message: errorMessage, trigger: 'change' }];
}
