<script lang="ts">
  import type { PageProps } from './$types'
  import { ExternalLink } from '@lucide/svelte'

  import { Helmet } from '$lib/components/helmet'
  import * as Avatar from '$lib/components/ui/avatar'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Separator } from '$lib/components/ui/separator'
  import { ChangePasswordForm } from '$lib/components/forms/change-password-form'

  let { data }: PageProps = $props()
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

        <p class="text-lg">Name</p>

        <Input value={data.user.name} disabled />

        <p class="text-sm">
          Changing of name is not currently available. (Will be available soon.)
        </p>
      </div>
    </section>

    <section class="space-y-4">
      <header>
        <h2 class="font-heading text-2xl">Account</h2>
      </header>

      <Separator />

      <div class="space-y-3">
        <p class="text-lg">Email</p>

        <Input value={data.user.email} disabled />

        <p class="text-sm">
          Changing of email is not currently available. (Will be available soon.)
        </p>

        <p class="text-lg">Username</p>

        <Input value={data.user.username} disabled />

        <p class="text-sm">
          Changing of username is not currently available. (Will be available soon.)
        </p>
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
  </div>
</div>
