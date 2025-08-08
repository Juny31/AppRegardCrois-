import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, IconButton, Fade, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function InlineEdit({
  value,
  onSave,
  type = "text",
  style = {},
  minRows = 2,
  placeholder = "— vide —",
  disabled = false,
  ...rest
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [focus, setFocus] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  useEffect(() => { setDraft(value ?? ""); }, [value]);

  function handleSave() {
    if (draft !== value) onSave(draft);
    setEditing(false);
  }
  function handleCancel() {
    setDraft(value ?? "");
    setEditing(false);
  }
  function handleKey(e) {
    if (type === "textarea") {
      if (e.key === "Escape") handleCancel();
      if (e.ctrlKey && e.key === "Enter") handleSave();
    } else {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") handleCancel();
    }
  }

  if (!editing) {
    return (
      <Box
        component="span"
        sx={{
          cursor: disabled ? "not-allowed" : "pointer",
          borderBottom: !disabled ? "1px dotted #bbb" : undefined,
          display: "inline-flex",
          alignItems: "center",
          px: 0.3,
          borderRadius: 1,
          transition: "background 0.18s",
          color: !value ? "#aaa" : "inherit",
          ...style
        }}
        tabIndex={disabled ? -1 : 0}
        aria-label="Éditer"
        onClick={disabled ? undefined : () => setEditing(true)}
        onKeyDown={e => { if (!disabled && (e.key === "Enter" || e.key === " ")) setEditing(true); }}
        role="button"
        aria-disabled={disabled}
      >
        <span style={{ minWidth: 40, color: !value ? "#aaa" : "#222" }}>
          {value || placeholder}
        </span>
        {!disabled &&
          <Fade in timeout={350}>
            <EditIcon sx={{ fontSize: 17, ml: 0.5, color: "#909090" }} />
          </Fade>
        }
      </Box>
    );
  }

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        bgcolor: "#f7fbfc",
        border: "1.5px solid #1e88e5",
        borderRadius: 1.4,
        px: 1,
        py: 0.6,
        minWidth: 90,
        boxShadow: focus ? "0 0 0 3px #90caf9aa" : "0 1px 6px 0 #0001",
        ...style
      }}
    >
      <TextField
        inputRef={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={handleKey}
        multiline={type === "textarea"}
        minRows={type === "textarea" ? minRows : undefined}
        size="small"
        variant="standard"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        sx={{
          fontSize: style.fontSize || 15,
          minWidth: style.minWidth || 90,
          background: "none",
          "& .MuiInputBase-input": { py: 0.8, background: "none" },
          flex: 1,
        }}
        disabled={disabled}
        aria-label="Édition en ligne"
        {...rest}
      />
      <Tooltip title="Valider" enterDelay={300}>
        <span>
          <IconButton
            onClick={handleSave}
            size="small"
            color="primary"
            disabled={draft === value}
            sx={{ ml: 0.5, mr: 0.5, opacity: draft !== value ? 1 : 0.6 }}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Annuler" enterDelay={300}>
        <span>
          <IconButton
            onClick={handleCancel}
            size="small"
            color="error"
            sx={{ ml: 0.2, mr: 0.1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}

export default InlineEdit;
