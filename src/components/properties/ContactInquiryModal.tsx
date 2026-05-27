import { useAuth0 } from '@auth0/auth0-react'
import { Loader2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { createInquiry } from '@/api/client'
import { auth0Audience } from '@/config'
import { toListingKey } from '@/lib/listingKeys'
import type { PropertyListing } from '@/types/property'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { resolveDisplayEmail, resolveDisplayName } from '@/utils/profile'

interface ContactInquiryModalProps {
  property: PropertyListing | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactInquiryModal({ property, open, onOpenChange }: ContactInquiryModalProps) {
  const { user, getAccessTokenSilently } = useAuth0()
  const [name, setName] = useState(resolveDisplayName(undefined, user) ?? '')
  const [email, setEmail] = useState(resolveDisplayEmail(undefined, user) ?? '')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!property) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: auth0Audience },
      })
      const { listingKey, propertyId } = toListingKey(property.id)

      await createInquiry(token, {
        listing_key: listingKey,
        property_id: propertyId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      })

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setSuccess(false)
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact about this property</DialogTitle>
          <DialogDescription>
            {property ? `${property.title} · ${property.location}` : 'Send a message to the listing agent.'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-success">
              Your inquiry was submitted successfully. An agent will reach out soon.
            </p>
            <Button onClick={() => handleClose(false)}>Close</Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="inquiry-name">
                Name
              </label>
              <Input
                id="inquiry-name"
                value={name}
                required
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="inquiry-email">
                Email
              </label>
              <Input
                id="inquiry-email"
                type="email"
                value={email}
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="inquiry-phone">
                Phone (optional)
              </label>
              <Input
                id="inquiry-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="inquiry-message">
                Message
              </label>
              <textarea
                id="inquiry-message"
                rows={4}
                required
                value={message}
                placeholder="I am interested in scheduling a visit…"
                className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none placeholder:text-placeholder focus-visible:ring-2 focus-visible:ring-ring"
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send inquiry'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
