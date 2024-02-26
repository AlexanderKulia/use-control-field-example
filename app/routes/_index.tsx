import { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { ValidatedForm, useControlField, useField, useIsSubmitting, validationError } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";

type InputProps = {
  name: string;
  label: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export const ValidatedInput = ({ name, label, value, onChange }: InputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input {...getInputProps({ id: name, value, onChange })} />
      {error && <span className="my-error-class">{error}</span>}
    </div>
  );
};

export const SubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
};

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});
const formData = zfd.formData(schema);
export const validator = withZod(formData);

export const loader = async () => {
  return {
    firstName: "alex",
    lastName: "k",
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await validator.validate(await request.formData());
  if (data.error) return validationError(data.error);
  return data.data;
};

const formId = "form";

export default function Demo() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [firstName, setFirstName] = useControlField<string>("firstName", formId);

  useEffect(() => {
    console.log("first name on first render is", firstName);
    setFirstName("useEffect");
    console.log("first name set in use effect is", firstName);
  }, []);

  return (
    <ValidatedForm id={formId} validator={validator} method="post" defaultValues={loaderData}>
      <ValidatedInput
        name="firstName"
        label="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <ValidatedInput name="lastName" label="Last Name" />
      <h2>Default values</h2>
      <pre>{JSON.stringify(loaderData, null, 2)}</pre>
      <SubmitButton />
      {actionData && (
        <>
          <h2>Submitted values</h2>
          <pre>{JSON.stringify(actionData, null, 2)}</pre>
        </>
      )}
    </ValidatedForm>
  );
}
