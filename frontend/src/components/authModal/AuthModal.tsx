import { useState, type ClipboardEvent } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { FormikTextInput } from "@/components/formik/FormikTextInput";
import { FormikPasswordInput } from "@/components/formik/FormikPasswordInput";

type LoginRole = "teacher" | "student";

interface AuthModalProps {
  role: LoginRole;
  show: boolean;
  close: () => void;
}

interface LoginFormValues {
  phoneNumber: string;
  password: string;
}

interface ValidateResponse {
  status: "Success" | "Failure";
  message: string;
  token?: string;
}

const validationSchema = Yup.object({
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
    .required("Phone number is required"),
  password: Yup.string().required("Password is required"),
});

const preventPaste = (e: ClipboardEvent) => e.preventDefault();

const AuthModal = ({ role, show, close }: AuthModalProps) => {
  const [result, setResult] = useState<{ verified: boolean; message: string } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const response = await apiClient.post<ValidateResponse>("/auth/validate", {
        role,
        phoneNumber: values.phoneNumber,
        password: values.password,
      });
      const { status, message, token } = response.data;
      if (status === "Success" && token) {
        setResult({ verified: true, message });
        setTimeout(() => {
          login(token);
          navigate("/landing");
        }, 1000);
      }
    } catch (error) {
      let message = "Something went wrong.";
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
        message =
          error.code === "ERR_NETWORK"
            ? "Cannot connect to server. Please contact admin."
            : (data?.message ?? message);
      }
      setResult({ verified: false, message });
      setTimeout(() => setResult(null), 1000);
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        {result ? (
          <div className="tw:flex tw:flex-col tw:items-center tw:gap-3 tw:py-6">
            {result.verified ? (
              <CheckCircle2 className="tw:size-12 tw:text-green-600" />
            ) : (
              <XCircle className="tw:size-12 tw:text-destructive" />
            )}
            <p className="tw:text-center tw:text-sm">{result.message}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
            </DialogHeader>
            <Formik<LoginFormValues>
              initialValues={{ phoneNumber: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="tw:grid tw:gap-4">
                  <FormikTextInput
                    name="phoneNumber"
                    label="Phone number"
                    placeholder="Enter phone number"
                    description="Enter your phone number."
                    maxLength={10}
                    onPaste={preventPaste}
                  />
                  <FormikPasswordInput
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    description="Enter the password provided to you by the school."
                    onPaste={preventPaste}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={close}>
                      Close
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      Validate
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
