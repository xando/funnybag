youtube = """
<iframe title="YouTube video player" 
        width="480" height="390" 
        src="$name" 
        frameborder="0" allowfullscreen>
</iframe>
"""

vimeo = """
<iframe src="$name&autoplay=0" width="640" height="385" frameborder="0"></iframe>
"""

metacafe = """
<div style="background:#000000;width:600px;height:370px">
  <embed flashVars="playerVars=showStats=no|autoPlay=no|"
         src="$name"
         width="640" height="385"
         wmode="transparent"
         allowFullScreen="true"
         allowScriptAccess="always"
         name="Metacafe_5470065"
         pluginspage="http://www.macromedia.com/go/getflashplayer"
         type="application/x-shockwave-flash">
  </embed>
</div>
"""

dailymotion = """
<iframe frameborder="0" width="640" height="385"
        src="$name">
</iframe>

"""

blip = """
<embed src="$name" type="application/x-shockwave-flash"
       width="640" height="385" allowscriptaccess="always" allowfullscreen="true">
</embed>
"""

rutube = """
<OBJECT width="640" height="385">
  <PARAM name="movie" value="$name"></PARAM>
  <PARAM name="wmode" value="window"></PARAM>
  <PARAM name="allowFullScreen" value="true"></PARAM>
  <EMBED src="$name"
         type="application/x-shockwave-flash" wmode="window"
         width="640" height="385" allowFullScreen="true" ></EMBED>
</OBJECT>
"""

services = {'youtube' : youtube,
            'vimeo': vimeo,
            'metacafe' : metacafe,
            'dailymotion' : dailymotion,
            'blip' : blip,
            'rutube' : rutube}
