<?php

namespace App\Mail;

use App\Models\Sale;
use App\Enum\SaleType;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class SalePDF extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(protected Sale $sale, protected ?string $customSubject = null, protected ?string $template = null)
    {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: $this->sale?->internalContact?->email ? new Address($this->sale->internalContact->email, $this->sale->internalContact->name) : null,
            subject: $this->customSubject ?? sprintf($this->sale->sale_type == 'sale' ? 'Order N° %s': 'Quote N° %s', $this->sale->code)
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {

        $config = (new HtmlSanitizerConfig())
            ->allowSafeElements();

        $sanitizer = new HtmlSanitizer($config);

        return new Content(
            markdown: 'emails.empty',
            with: [
                'content' => $sanitizer->sanitize($this->template)
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $pdf = $this->sale->generateSalePdf();

        return [
            Attachment::fromData(fn () => $pdf, $this->sale->code.'.pdf')
                ->withMime('application/pdf')
        ];
    }
}
