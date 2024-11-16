"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { BeatLoader } from "react-spinners";

import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterSchema } from "@/index";
import { startTransition, useTransition } from "react";
import { register } from "@/lib/actions";
// import { useToast } from "@/hooks/use-toast";
// import { Icons } from "../Icons";

export default function SignUpForm() {
  const router = useRouter();
  // const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  function onSubmit(data: z.infer<typeof RegisterSchema>) {
    startTransition(async () => {
      const res = await register(data);
      if (res.success) {
        // setError(error);
        router.push("/login");
      } else {
        // toast({
        //   description: res.message,
        //   variant: "destructive",
        // });
        alert("error");
      }
    });
  }

  return (
    <Card className="w-[350px]  mx-auto bg-[rgb(38,38,38)] mt-20 !rounded-[0px] border-0  ">
      <CardHeader>
        <CardTitle className="text-2xl">
          <div className=" mt-[36px] mb-[12px] text-white flex w-full items-center justify-center scale-150 ">
            {/* <Icons.InstaText /> */}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2  ">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Email</FormLabel> */}
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      className="bg-transparent text-[rgb(245,245,245)] rounded-[3px] border border-[rgb(54,54,54)] 
                    focus-within:border-[rgb(69,69,69)] outline-none pt-[9px] pb-[7px] pl-[8px]  w-full
                     placeholder:text-[rgb(115,115,115)] placeholder:text-[12px] h-[36px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Email</FormLabel> */}
                  <FormControl>
                    <Input
                      placeholder="email"
                      {...field}
                      className="bg-transparent text-[rgb(245,245,245)] rounded-[3px] border border-[rgb(54,54,54)] 
                    focus-within:border-[rgb(69,69,69)] outline-none pt-[9px] pb-[7px] pl-[8px]  w-full
                     placeholder:text-[rgb(115,115,115)] placeholder:text-[12px] h-[36px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Password</FormLabel> */}
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      {...field}
                      className="bg-transparent text-[rgb(245,245,245)] rounded-[3px] border border-[rgb(54,54,54)]
                     focus-within:border-[rgb(69,69,69)] outline-none pt-[9px] pb-[7px] 
                  pl-[8px]  w-full placeholder:text-[rgb(115,115,115)] placeholder:text-[12px] h-[36px] "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="bg-[rgb(0,149,246)] text-[rgb(245,245,245)] rounded-[8px] border border-[rgb(54,54,54)]
             focus-within:border-[rgb(69,69,69)] outline-none  w-full py-[7px] px-[16px] font-bold text-[13px]
              hover:bg-[#1877F2] disabled:opacity-80  "
              disabled={isPending}
            >
              {isPending ? <BeatLoader size={5} color="#ffffff" /> : "Sign up"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
