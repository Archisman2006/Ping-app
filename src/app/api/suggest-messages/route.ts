import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  // apiKey: process.env.GEMINI_API_KEY,
  // baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const response = await openai.chat.completions.create({
      //model: 'gemini-flash-lite-latest',
      model:'openai/gpt-oss-20b',
      max_tokens: 500,
      stream: true,
      messages: [
        {role:'user',content:'Do not include any thought process or chain of reasoning. Respond directly with the output only.'},
        { role: 'user', content: prompt }]
    });
    const encoder=new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });
    
    
    return new Response(stream,{
      headers:{
        'content-type':'text/plain; charset=utf-8'
      }
    })
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      // OpenAI API error handling
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      // General error handling
      console.error('An unexpected error occurred:', error);
      return NextResponse.json({
        error:'An unexpected error occured'
      },{
        status:500
      });
    }
  }
}