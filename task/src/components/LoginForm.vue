<template>
  <Form @submit="submitLogin" :validation-schema="loginFormSchema">
    <div class="form-group">
      <label for="email">Tên đăng nhập:</label>

      <Field
        name="email"
        type="text"
        class="form-control"
        v-model="loginLocal.email"
      />

      <ErrorMessage name="email" class="error-feedback" />
    </div>
    <div class="form-group">
      <label for="Password">Mật khẩu:</label>

      <Field
        name="Password"
        type="password"
        class="form-control"
        v-model="loginLocal.Password"
      />

      <ErrorMessage name="Password" class="error-feedback" />
    </div>
    <div class="form-group">
      <button class="btn btn-primary">Đăng nhập</button>
    </div>
  </Form>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
export default {
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  emits: ["submit:login"],
  props: {
    loginInfo: { type: Object, required: true },
  },
  data() {
    const loginFormSchema = yup.object().shape({
      email: yup
        .string()
        .required("Vui lòng nhập tên đăng nhập."),
      Password: yup
        .string()
        .required("Vui lòng nhập mật khẩu.")
        .min(8, "Mật khẩu phải ít nhất 8 ký tự.")
        .max(16, "Mật khẩu có nhiều nhất 16 ký tự."),
    });
    return {
      loginLocal: this.loginInfo,
      loginFormSchema,
    };
  },
  methods: {
    submitLogin() {
      this.$emit("submit:login", this.loginLocal);
    },
  },
};
</script>
<style scoped>
@import "../assets/form.css";
</style>
