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
<p><strong>Gold</strong>{{ range . }} <a href="{{ .Website }}" target="_blank" rel="noopener sponsored"><img src="{{ .LogoWithSize 130 }}" alt="{{ .Name }}" style="height:88px;width:auto"/></a>{{ end }}</p>
{{- end }}
{{- with index .ByTier "silver" }}
<p><strong>Silver</strong>{{ range . }} <a href="{{ .Website }}" target="_blank" rel="noopener sponsored"><img src="{{ .LogoWithSize 84 }}" alt="{{ .Name }}" style="height:54px;width:auto"/></a>{{ end }}</p>
{{- end }}
{{- with index .ByTier "bronze" }}
<p><strong>Bronze</strong>{{ range . }} <a href="{{ .Website }}" target="_blank" rel="noopener sponsored"><img src="{{ .LogoWithSize 56 }}" alt="{{ .Name }}" style="height:36px;width:auto"/></a>{{ end }}</p>
{{- end }}
{{- with index .ByTier "backer" }}
<p><strong>Backers</strong>{{ range . }}<a href="{{ .Website }}">{{ .Name }}</a> &nbsp;{{ end }}</p>
{{- end }}
</div>
{{- else }}
<div class="sp-showcase">
  node-cron doesn't have sponsors yet. <a href="https://github.com/sponsors/node-cron">Yours could be the first logo here.</a>
</div>
{{- end }}
