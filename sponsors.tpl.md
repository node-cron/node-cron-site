{{/*
  Standalone template for @goreleaser/sponsors, rendered into src/sponsors.md
  between the <!-- sponsors:begin --> / <!-- sponsors:end --> markers by:
     npx -y @goreleaser/sponsors apply sponsors.json sponsors.tpl.md src/sponsors.md
  Data: .Sponsors, .Tiers, .ByTier. Sponsor fields: .Name .Website .Image .LogoWithSize(size).
*/ -}}
<!-- auto-generated from sponsors.tpl.md by @goreleaser/sponsors, do not edit by hand -->
{{- if .Sponsors }}
<div class="sp-list" align="center">
{{- with index .ByTier "gold" }}
<p><strong>Gold</strong><br/>{{ range . }} <a href="{{ .Website }}" target="_blank" rel="noopener sponsored"><img src="{{ .LogoWithSize 120 }}" alt="{{ .Name }}" height="80"/></a>{{ end }}</p>
{{- end }}
{{- with index .ByTier "silver" }}
<p><strong>Silver</strong><br/>{{ range . }} <a href="{{ .Website }}" target="_blank" rel="noopener sponsored"><img src="{{ .LogoWithSize 96 }}" alt="{{ .Name }}" height="60"/></a>{{ end }}</p>
{{- end }}
{{- with index .ByTier "bronze" }}
<p><strong>Bronze</strong><br/>{{ range . }} <a href="{{ .Website }}" target="_blank" rel="noopener sponsored"><img src="{{ .LogoWithSize 72 }}" alt="{{ .Name }}" height="44"/></a>{{ end }}</p>
{{- end }}
{{- with index .ByTier "backer" }}
<p><strong>Backers</strong><br/>{{ range . }}<a href="{{ .Website }}">{{ .Name }}</a> &nbsp;{{ end }}</p>
{{- end }}
</div>
{{- else }}
<div class="sp-showcase">
  node-cron doesn't have sponsors yet. <a href="https://github.com/sponsors/node-cron">Yours could be the first logo here.</a>
</div>
{{- end }}
