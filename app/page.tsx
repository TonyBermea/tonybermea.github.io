"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function MonumentoWebsite() {
  const [emailHover, setEmailHover] = useState(false)
  const [instagramHover, setInstagramHover] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const getPageClasses = () => {
    if (emailHover || instagramHover) return "text-white"
    return "bg-white text-black"
  }

  const getPageStyles = () => {
    if (emailHover) return { backgroundColor: "#006341" }
    if (instagramHover) return { backgroundColor: "#C8102E" }
    return {}
  }

  const getImageFilterClasses = () => {
    if (emailHover) return "hue-rotate-[200deg] saturate-150 brightness-110"
    if (instagramHover) return "hue-rotate-[340deg] saturate-150 brightness-110"
    return "saturate-100 brightness-100"
  }

  const sourceSerifStyle = {
    fontFamily: '"Source Serif 4", serif',
    fontWeight: 200,
    fontStyle: "italic",
    fontOpticalSizing: "auto",
  }

  return (
    <div className={`min-h-screen relative ${getPageClasses()}`} style={getPageStyles()}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-6">
        <h1 className="tracking-tight font-normal text-2xl md:text-3xl lg:text-4xl">TONY BERMEA</h1>

        {/* Mobile Menu Toggle - Only visible on mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute right-6 top-6 md:hidden w-8 h-8 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-6">
            <span
              className={`absolute top-1/2 left-1/2 w-4 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                menuOpen ? "rotate-45" : "rotate-0"
              }`}
            />
            <span
              className={`absolute top-1/2 left-1/2 w-4 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                menuOpen ? "-rotate-45" : "rotate-90"
              }`}
            />
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Close Button Only */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-6 z-50 w-8 h-8 flex items-center justify-center"
          aria-label="Close menu"
        >
          <div className="relative w-6 h-6">
            <span className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
            <span className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 -rotate-45" />
          </div>
        </button>

        {/* Overlay Content */}
        <div className="p-6 h-full flex flex-col justify-center">
          <div className="text-black space-y-2 text-center leading-tight">
            <div className="text-2xl font-normal">AN EXPERIENCE ENGINEER </div>
            <div className="text-lg" style={sourceSerifStyle}>
              and software consultant
            </div>
            <div className="text-lg font-normal">
              <span style={sourceSerifStyle}>specialized in </span> 
            </div>
            <div className="text-2xl font-normal">HUMAN-DRIVEN PROJECTS </div>
            <div className="text-lg" style={sourceSerifStyle}>
              oriented to
            </div>
            <div className="text-2xl font-normal">BRANDS, </div>
            <div className="text-2xl font-normal">
              WEB DEV & CLOUD SOLUTIONS.{" "}
              <span className="text-lg" style={sourceSerifStyle}>
                Based in
              </span>
            </div>
            <div className="text-lg" style={sourceSerifStyle}>
              Kansai <span className="text-sm align-super">(🇯🇵)</span>
            </div>
            <div className="text-2xl font-normal mt-4">
              FIND ME{" "}
              <span className="text-lg" style={sourceSerifStyle}>
                @
              </span>{" "}
              <Link href="https://www.behance.net/tbdev" className="hover:underline font-light">
                Behance
              </Link>
            </div>
            <div className="text-2xl font-normal">
              <span className="text-lg" style={sourceSerifStyle}>
                &
              </span>{" "}
              <Link href="https://www.linkedin.com/in/tony-bermea/" className="hover:underline font-light">
                LinkedIn
              </Link>
            </div>
            <div className="text-2xl font-normal mt-6">
              T{" "}
              <a href="tel:+8107091282315" className="hover:cursor-pointer">
                <span className="text-sm align-super" style={sourceSerifStyle}>
                  +81
                </span>{" "}
                (0)70-9128-2315
              </a>
            </div>
            <div className="text-lg mt-2">
              <a
                href="mailto:hello@tonybermea.dev"
                className="hover:underline"
                style={sourceSerifStyle}
                onMouseEnter={() => setEmailHover(true)}
                onMouseLeave={() => setEmailHover(false)}
              >
                hello@tonybermea.dev
              </a>
            </div>
            <div className="text-2xl font-normal mt-4">
              <a
                href="https://github.com/TonyBermea"
                className="hover:underline font-normal"
                onMouseEnter={() => setInstagramHover(true)}
                onMouseLeave={() => setInstagramHover(false)}
              >
                GITHUB
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Content - Hidden on mobile */}
      <section className="hidden md:block max-w-6xl mx-auto px-6 py-12 pt-24">
        <div className="text-center mb-16">
          {/* 5-line paragraph with all contact info */}
          <div className="max-w-5xl mx-auto text-lg leading-relaxed mb-16">
            <div className="text-center space-y-3 text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl leading-relaxed">
              <div className="">
                AN EXPERIENCE ENGINEER <span style={sourceSerifStyle}>and</span>{" "}
                <span style={sourceSerifStyle}>software consultant</span>
              </div>
              <div className="font-normal">
                <span style={sourceSerifStyle}>specialized in</span>{" "}
                <strong className="font-normal">HUMAN-DRIVEN PROJECTS</strong>{" "}
                <span style={sourceSerifStyle}>oriented to</span>
              </div>
              <div>
                <strong className="font-normal">BRANDS, WEB DEV & CLOUD SOLUTIONS</strong>.
              </div>
              <div className="font-normal">
                <span style={sourceSerifStyle}>Based in Kansai</span> <span className="text-sm align-super">(🇯🇵)</span>{" "}
                FIND ME <span style={sourceSerifStyle}>@</span>{" "}
                <Link href="https://www.behance.net/tbdev" className="hover:underline font-light">
                  Behance
                </Link>{" "}
                <span style={sourceSerifStyle}>&</span>{" "}
                <Link href="https://www.linkedin.com/in/tony-bermea/" className="hover:underline font-light">
                  LinkedIn
                </Link>
                .
              </div>
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <span className="font-normal">T</span>
                <a href="tel:+8107091282315" className="hover:cursor-pointer">
                  <span className="text-sm align-super" style={sourceSerifStyle}>
                    +81
                  </span>{" "}
                  (0)70-9128-2315
                </a>
                <a
                  href="mailto:hello@tonybermea.dev"
                  className="hover:underline"
                  style={sourceSerifStyle}
                  onMouseEnter={() => setEmailHover(true)}
                  onMouseLeave={() => setEmailHover(false)}
                >
                  hello@tonybermea.dev
                </a>
                <a
                  href="https://github.com/TonyBermea"
                  className="hover:underline font-normal"
                  onMouseEnter={() => setInstagramHover(true)}
                  onMouseLeave={() => setInstagramHover(false)}
                >
                  GITHUB
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portrait Image - Always at bottom */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
        <div className="relative overflow-hidden">
          <Image
            src="/images/portrait.png"
            alt="Portrait"
            width={360}
            height={450}
            className={`w-full h-auto object-cover object-center transition-all duration-300 ${getImageFilterClasses()}`}
            style={{
              display: "block",
              margin: 0,
              padding: 0,
              border: "none",
              outline: "none",
              verticalAlign: "top",
            }}
          />
        </div>
      </div>
    </div>
  )
}
