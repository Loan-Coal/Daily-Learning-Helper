export const isEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
export const isNotEmpty = (str: string) => str.trim().length > 0;
