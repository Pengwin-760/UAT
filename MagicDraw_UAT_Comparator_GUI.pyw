#!/usr/bin/env python3
"""
MagicDraw_UAT_Comparator_GUI.pyw

Windows GUI front end for UAT_Fingerprint_Comparator_v1_9.py.

Expected workflow:
    Baseline  : MagicDraw 2022xR2 fingerprint JSON
    Candidate : MagicDraw 2024xR3 fingerprint JSON

The GUI labels both expectations explicitly and performs a soft runtime-family
validation using metadata already captured in the fingerprint. It does not treat
Java/Groovy versions as proof of the exact MagicDraw release.
"""

from __future__ import annotations

import json
import os
import pathlib
import subprocess
import sys
import threading
import traceback
import webbrowser
from typing import Any, Dict, Optional, Tuple

import tkinter as tk
from tkinter import filedialog, messagebox, ttk

import UAT_Fingerprint_Comparator_v1_9 as engine

APP_NAME = "MagicDraw Migration UAT Comparator"
APP_VERSION = "1.0.0"
ENGINE_VERSION = getattr(engine, "TOOL_VERSION", "unknown")
EXPECTED_BASELINE = "MagicDraw 2022xR2"
EXPECTED_CANDIDATE = "MagicDraw 2024xR3"


class InputState:
    def __init__(self, expected_release: str, expected_java_major: str, expected_groovy_major: Optional[str] = None):
        self.expected_release = expected_release
        self.expected_java_major = expected_java_major
        self.expected_groovy_major = expected_groovy_major
        self.path: Optional[pathlib.Path] = None
        self.data: Optional[Dict[str, Any]] = None
        self.valid_fingerprint = False
        self.runtime_match: Optional[bool] = None
        self.message = "No fingerprint selected."


class App(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title(f"{APP_NAME} {APP_VERSION}")
        self.geometry("980x700")
        self.minsize(860, 620)

        self.baseline = InputState(EXPECTED_BASELINE, "11", "3")
        self.candidate = InputState(EXPECTED_CANDIDATE, "17", "4")

        self.output_dir = tk.StringVar(value="")
        self.status_var = tk.StringVar(value="Select a 2022xR2 baseline fingerprint and a 2024xR3 candidate fingerprint.")
        self.result_var = tk.StringVar(value="Not run")
        self.findings_var = tk.StringVar(value="—")
        self.last_html: Optional[pathlib.Path] = None
        self.last_output_dir: Optional[pathlib.Path] = None
        self._busy = False

        self._configure_style()
        self._build_ui()
        self._update_compare_enabled()

    def _configure_style(self) -> None:
        style = ttk.Style(self)
        try:
            style.theme_use("vista")
        except Exception:
            pass
        style.configure("Title.TLabel", font=("Segoe UI", 18, "bold"))
        style.configure("Section.TLabel", font=("Segoe UI", 11, "bold"))
        style.configure("Expected.TLabel", font=("Segoe UI", 10, "bold"))
        style.configure("Muted.TLabel", foreground="#5b6573")
        style.configure("Good.TLabel", foreground="#18794e")
        style.configure("Warn.TLabel", foreground="#a15c00")
        style.configure("Bad.TLabel", foreground="#b42318")
        style.configure("ResultPass.TLabel", foreground="#18794e", font=("Segoe UI", 15, "bold"))
        style.configure("ResultFail.TLabel", foreground="#b42318", font=("Segoe UI", 15, "bold"))
        style.configure("ResultIdle.TLabel", foreground="#5b6573", font=("Segoe UI", 15, "bold"))

    def _build_ui(self) -> None:
        outer = ttk.Frame(self, padding=20)
        outer.pack(fill="both", expand=True)
        outer.columnconfigure(0, weight=1)

        ttk.Label(outer, text=APP_NAME, style="Title.TLabel").grid(row=0, column=0, sticky="w")
        ttk.Label(
            outer,
            text=(f"Desktop front end for semantic comparison of MagicDraw migration fingerprints. "
                  f"Comparator engine v{ENGINE_VERSION}."),
            style="Muted.TLabel",
            wraplength=900,
        ).grid(row=1, column=0, sticky="w", pady=(4, 18))

        instruction = ttk.LabelFrame(outer, text="Required input order", padding=12)
        instruction.grid(row=2, column=0, sticky="ew", pady=(0, 14))
        instruction.columnconfigure(0, weight=1)
        ttk.Label(
            instruction,
            text="1. BASELINE = MagicDraw 2022xR2 fingerprint     2. CANDIDATE = MagicDraw 2024xR3 fingerprint",
            style="Expected.TLabel",
        ).grid(row=0, column=0, sticky="w")
        ttk.Label(
            instruction,
            text="The 2022 model may originate in TWC and the 2024 model may be the locally saved/migrated copy. No 2024 TWC upload is required.",
            style="Muted.TLabel",
            wraplength=880,
        ).grid(row=1, column=0, sticky="w", pady=(4, 0))

        inputs = ttk.Frame(outer)
        inputs.grid(row=3, column=0, sticky="ew")
        inputs.columnconfigure(0, weight=1)
        inputs.columnconfigure(1, weight=1)

        self.base_widgets = self._build_input_card(
            inputs,
            column=0,
            title="Baseline fingerprint",
            expected="EXPECTED: MagicDraw 2022xR2",
            browse_command=lambda: self._choose_fingerprint("baseline"),
        )
        self.cand_widgets = self._build_input_card(
            inputs,
            column=1,
            title="Candidate fingerprint",
            expected="EXPECTED: MagicDraw 2024xR3",
            browse_command=lambda: self._choose_fingerprint("candidate"),
        )

        output = ttk.LabelFrame(outer, text="Report output", padding=12)
        output.grid(row=4, column=0, sticky="e