'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";

const SignUp = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
        },
        mode: 'onBlur'
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail(data);
            if (result.success) {
                router.push('/');
                return;
            }
            toast.error('Sign up failed', {
                description: result.error ?? 'We could not create your account.',
            });
        } catch (e) {
            console.error(e);
            toast.error('Sign up failed', {
                description: e instanceof Error ? e.message : 'Failed to create an account.'
            })
        }
    }

    return (
        <>
            <h1 className="form-title">Create your account</h1>
            <p className="text-sm text-gray-400 mb-6">
                Start with the essentials. You can search stocks, build a watchlist, and create alerts after sign in.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="fullName"
                    label="Full Name"
                    placeholder="Enter full name"
                    register={register}
                    error={errors.fullName}
                    validation={{ required: 'Full name is required', minLength: 2 }}
                />

                <InputField
                    name="email"
                    label="Email"
                    placeholder="you@example.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/,
                            message: 'Please enter a valid email address'
                        }
                    }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter a strong password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: 'Password is required', minLength: 8 }}
                />

                <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                    {isSubmitting ? 'Creating Account' : 'Create Account'}
                </Button>

                <FooterLink text="Already have an account?" linkText="Sign in" href="/sign-in" />
            </form>
        </>
    )
}

export default SignUp;
