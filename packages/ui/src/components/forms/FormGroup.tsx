import { JSX, splitProps, Show } from 'solid-js'
import { clsx } from 'clsx'

export interface FormGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
  children: JSX.Element
}

export function FormGroup(props: FormGroupProps) {
  const [local, others] = splitProps(props, [
    'label',
    'error',
    'required',
    'children',
    'class',
  ])

  return (
    <div class={clsx('form-group', local.class)} {...others}>
      <Show when={local.label}>
        <label class="form-label">
          {local.label}
          <Show when={local.required}>
            <span class="text-accent-500 ml-1">*</span>
          </Show>
        </label>
      </Show>
      {local.children}
      <Show when={local.error}>
        <p class="form-error">{local.error}</p>
      </Show>
    </div>
  )
}
