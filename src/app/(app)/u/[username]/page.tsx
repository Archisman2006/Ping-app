'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios, { AxiosError } from 'axios'
import { useCompletion } from '@ai-sdk/react'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { messageSchema } from '@/src/schema/Message.schema'
import { useToast } from '@/components/ui/use-toast'
import { ApiResponse } from '@/src/types/ApiResponse'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const initialDefaultMessages = 
    "What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?"

const Page = () => {
    const [isSending, setIsSending] = useState(false)
    const { toast } = useToast()
    const params = useParams<{ username: string }>()
    const username = params?.username

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
        content: '',
        },
    })

    const { setValue, reset } = form

    const {
        completion,
        complete,
        isLoading: isSuggesting,
    } = useCompletion({
        api: '/api/suggest-messages',
        streamProtocol: 'text',
        initialCompletion: initialDefaultMessages,
        onError: (error) => {
        toast({
            title: 'Error suggesting messages',
            description: error.message || 'Something went wrong',
            variant: 'destructive',
        })
        },
    })

    const suggestedMessages = completion
        ? completion.split('||').map((q) => q.trim()).filter(Boolean)
        : []

    const handleSelectMessage = (selectedMessage: string) => {
        setValue('content', selectedMessage, { shouldValidate: true })
    }

    const handleSuggestMessages = async () => {
        try {
        await complete('')
        } catch (error) {
        console.error('Failed to trigger completion', error)
        }
    }

    // const hasFetchedRef = React.useRef(false)
    // useEffect(() => {
    //     if (!hasFetchedRef.current) {
    //     hasFetchedRef.current = true
    //     complete('')
    //     }
    // }, [complete])   

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        if (!username) return

        try {
        setIsSending(true)
        const response = await axios.post<ApiResponse>('/api/send-message', {
            username,
            content: data.content,
        })

        reset({ content: '' })
        toast({
            title: 'Message sent successfully',
            description: response?.data?.message || 'Your message has been delivered.',
        })
        } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast({
            title: 'Cannot send message',
            description:
            axiosError.response?.data.message ??
            'User is not accepting messages at this time',
            variant: 'destructive',
        })
        } finally {
        setIsSending(false)
        }
    }

    return (
        <div className="container mx-auto my-8 p-4 max-w-4xl space-y-8">
        {/* 1. Header */}
        <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Send Anonymous Message to <span className="text-primary">@{username}</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
            Share your candid thoughts or feedback anonymously.
            </p>
        </div>

        {/* 2. Message Form */}
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-base font-medium">Your Message</FormLabel>
                    <FormControl>
                    <textarea
                        {...field}
                        rows={4}
                        placeholder="Write your anonymous message here..."
                        className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {/* 3. Send Message Button */}
            <div className="flex justify-center md:justify-start">
                <Button type="submit" disabled={isSending} className="w-full md:w-auto px-6">
                {isSending ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                    </>
                ) : (
                    <>
                    <Send className="mr-2 h-4 w-4" />
                    Send It
                    </>
                )}
                </Button>
            </div>
            </form>
        </Form>

        <Separator className="my-6" />

        {/* 4. Suggested Messages Section */}
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <h2 className="text-lg font-semibold">Suggested Messages</h2>
                <p className="text-sm text-muted-foreground">
                Click on any message to select it.
                </p>
            </div>

            {/* 5. Suggest Messages Button */}
            <Button
                type="button"
                variant="outline"
                onClick={handleSuggestMessages}
                disabled={isSuggesting}
                className="self-start sm:self-auto"
            >
                {isSuggesting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                </>
                ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Suggest New Messages
                </>
                )}
            </Button>
            </div>

            {/* 6. Three Clickable Messages */}
            <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                Messages
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {
                    isSuggesting ? (
                        <>
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </>
                    ) : suggestedMessages.length > 0 ? (
                suggestedMessages.map((msg, index) => (
                    <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectMessage(msg)}
                    className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-sm font-medium shadow-2xs"
                    >
                    {msg}
                    </button>
                ))
                ) : (
                <p className="text-sm text-muted-foreground">
                    No suggested messages available. Click suggest above.
                </p>
                )
                }
            </CardContent>
            </Card>
        </div>
        </div>
    )
    }

export default Page