<script lang="ts">
  import type { PageProps } from './$types'
  import { toast } from 'svelte-sonner'
  import { CircleAlertIcon, ExternalLink } from '@lucide/svelte'

  import { deleteAccountCommand } from '$lib/remote/user/data.remote'
  import { Helmet } from '$lib/components/helmet'
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Separator } from '$lib/components/ui/separator'
  import {
    UpdateEmailForm,
    UpdateNameForm,
    UpdateUsernameForm,
  } from '$lib/components/forms/settings'
  import { ChangePasswordForm } from '$lib/components/forms/change-password-form'

  let { data }: PageProps = $props()

  let open = $state(false)
</script>

<Helmet title="Settings | fancanon" />

<div class="min-h-screen">
  <div class="border-b border-dashed">
    <header class="mx-auto w-full max-w-screen-lg space-y-3 px-3 py-10">
      <h1 class="font-heading text-3xl md:text-5xl">Settings</h1>
    </header>
  </div>

  <div class="mx-auto w-full max-w-screen-lg space-y-5 px-3 py-5">
    <section class="space-y-4">
      <header>
        <h2 class="font-heading text-2xl">Profile</h2>
      </header>

      <Separator />

      <div class="space-y-3">
        <p class="text-lg">Profile Picture</p>

        <div class="flex items-center justify-between gap-2">
          <a href="https://gravatar.com/emails/">
            <Avatar.Root class="size-24 border">
              <Avatar.Fallback>{data.user.name?.[0]}</Avatar.Fallback>
              <Avatar.Image src={`${data.user.image}&s=200`} alt={data.user.name} />
            </Avatar.Root>
          </a>

          <Button href="https://gravatar.com/emails/" size="lg">
            Change Gravatar <ExternalLink />
          </Button>
        </div>

        <UpdateNameForm currentValue={data.user.name} />
      </div>
    </section>

    <section class="space-y-4">
      <header>
        <h2 class="font-heading text-2xl">Account</h2>
      </header>

      <Separator />

      <div class="space-y-3">
        <UpdateEmailForm currentValue={data.user.email} />

        <UpdateUsernameForm currentValue={data.user.username} />
      </div>
    </section>

    <section class="space-y-4">
      <header>
        <h2 class="font-heading text-2xl">Security</h2>
      </header>

      <Separator />

      <div class="space-y-3">
        <p class="text-lg">Change Password</p>

        <div class="rounded-xl border p-5"><ChangePasswordForm /></div>
      </div>
    </section>

    <section class="space-y-4">
      <header class="flex items-center gap-2 text-destructive">
        <CircleAlertIcon class="" />

        <h2 class="font-heading text-2xl uppercase">Danger</h2>
      </header>

      <Separator />

      <div class="space-y-3">
        <Button variant="destructive" class="w-full" onclick={() => (open = !open)}
          >Delete Account Permanently</Button
        >
      </div>
    </section>
  </div>
</div>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Permanently Delete Account?</AlertDialog.Title>
      <AlertDialog.Description>
        This is permanent and once deleted we won't be able to recover any of your data and your
        username will become free to be used by others and... we'll be sorry to see you go 😢
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>

      <AlertDialog.Action
        onclick={async () => {
          await deleteAccountCommand()
          toast.error('Account Delete Verification Email Sent', {
            description: 'Please Check Your Inbox',
          })
          open = !open
        }}
      >
        Send Verification Email
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
