import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useEffect } from "react";
import { ValidatedForm, useControlField, useField, useIsSubmitting, validationError } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";

type InputProps = {
  name: string;
  label: string;
};

export const ValidatedInput = ({ name, label }: InputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input {...getInputProps({ id: name })} />
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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {
    firstName: "alex",
    lastName: "k",
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await validator.validate(await request.formData());
  if (data.error) return validationError(data.error);
  return null;
};

const formId = "form";

export default function Demo() {
  const data = useLoaderData<typeof loader>();
  const [firstName, setFirstName] = useControlField<string>("firstName", formId);

  useEffect(() => {
    // why is this field undefined, should it not be "alex" as provided to defaultValues?
    console.log(firstName);
  }, [firstName]);

  return (
    <ValidatedForm id={formId} validator={validator} method="post" defaultValues={data}>
      <ValidatedInput name="firstName" label="First Name" />
      <ValidatedInput name="lastName" label="Last Name" />
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <SubmitButton />
    </ValidatedForm>
  );
}
